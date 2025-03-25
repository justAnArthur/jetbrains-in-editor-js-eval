import fs from "node:fs/promises"
import vm from "node:vm"
import readline from "readline"

import { parse } from "acorn"
import { base, recursive } from "acorn-walk"

const codeStack = new Set()

async function loadRelativeFile(filePath) {
  return fs.readFile(filePath, 'utf-8')
}

// ---

const context = vm.createContext({ print: console.log })

function getLinesOfDepsCode(inputCode, inputLineNumber, codeLines, { ignoredDeps = [] } = {}) {
  const deps = []

  if (!inputCode && inputLineNumber)
    inputCode = codeLines[inputLineNumber - 1]

  const ast = parse(inputCode, { ecmaVersion: "latest", sourceType: "script" })

  const visitors = {
    Program(node, state, c) {
      for (const stmt of node.body) {
        c(stmt, state)
      }
    },

    AssignmentExpression(node, state, c) {
      if (node.left)
        c(node.left, state)

      if (node.right)
        c(node.right, state)
    },

    UpdateExpression(node) {
      deps.push(node.argument.name)
    },

    Identifier(node) {
      deps.push(node.name)
    }
  }
  recursive(ast, null, visitors, base)

  let depsCode = []

  for (const dep of deps) {
    if (ignoredDeps.includes(dep))
      continue

    for (let i = (inputLineNumber || codeLines.length) - 1; i >= 0; i--) {
      let codeLine = codeLines[i]

      let isDeclaration = false

      let isImport = false

      let isRelevant = false
      let _endFunctionIndex

      console.debug('dep:', dep, 'i:', i, 'codeLine:', codeLine)

      if (codeLine.includes('}') && !codeLine.includes('import')) {
        let inner = 0
        _endFunctionIndex = i
        while (i >= 0) {
          if (codeLines[i].includes('{'))
            inner -= 1

          if (codeLines[i].includes('}'))
            inner += 1

          if (inner === 0) {
            codeLine = codeLines.slice(i, _endFunctionIndex + 1).join('\n')
            break
          }

          i--
        }
      }

      const ast = parse(codeLine, { ecmaVersion: "latest", sourceType: "module" })

      const visitors = {
        VariableDeclaration(node, state, c) {
          for (const decl of node.declarations) {
            if (decl.id.name === dep) {
              isDeclaration = true
              isRelevant = true
              break
            }
          }
        },
        AssignmentExpression(node) {
          if (node.left.name === dep) {
            isRelevant = true
          }
        },
        UpdateExpression(node) {
          if (node.argument.name === dep) {
            isRelevant = true
          }
        },
        FunctionDeclaration(node) {
          if (node.id.name === dep) {
            for (const param of node.params) {
              if (param.type === "Identifier") {
                ignoredDeps.push(param.name)
              }
            }
            isRelevant = true
          }
        },
        ImportDeclaration(node) {
          for (const specifier of node.specifiers) {
            if (specifier.local.name === dep) {
              isRelevant = true
              isImport = true
            }
          }
        }
      }
      recursive(ast, null, visitors, base)

      if (!isRelevant)
        continue

      depsCode[i] = codeLine
      let _code = codeLine

      if (_endFunctionIndex !== undefined) {
        _code = codeLines.slice(i + 1, _endFunctionIndex).join('\n')
        _code = _code.replace('return ', '')
      }

      if (isImport)
        continue

      const _i = i
      const innerDepsCode = getLinesOfDepsCode(_code, _i, codeLines, { ignoredDeps: [dep, ...ignoredDeps] })

      for (let j = 0; j < innerDepsCode.length; j++) {
        if (innerDepsCode[j])
          depsCode[j] = innerDepsCode[j]
      }

      if (isDeclaration)
        break
    }

    ignoredDeps.push(dep)
  }

  return depsCode
}

function handleInputToGetPrint(inputCode) {
  const inputCodeAst = parse(inputCode, { ecmaVersion: "latest", sourceType: "script" })

  if (inputCodeAst.body[0]?.type === "ExpressionStatement")
    inputCode = `print(${inputCode})`

  return inputCode
}

// ---

const helpText =
  `.help - display this help message
.exit - exit the program
.clear - clear the console
.stack - display the current code stack
.debug - toggle debug mode
.load - load a file
#<number> - execute the code at the line number

anything else - execute the code
examples:
- 1 + 1
- #32
- const a = 1 ;> a + b`

const readLineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let isDebugMode = false
console.debug = (...args) => isDebugMode && console.log(...args)

;
(function readLineLoop() {
  readLineInterface
    .question('> ', async (input) => {
      try {
        switch (input.toLowerCase().trim()) {
          case '.help':
            console.log(helpText)
            readLineLoop()
            break

          case '.exit':
            readLineInterface.close()
            break

          case '.clear':
            console.clear()
            readLineLoop()
            break

          case '.stack':
            let j = 0, i = 0
            codeStack.forEach((code) => {
              console.log(`#${++i}`)
              code.split('\n').forEach((line) => {
                console.log(`${++j} | ${line}`)
              })
              console.log('\n')
            })
            readLineLoop()
            break

          case '.debug':
            isDebugMode = !isDebugMode
            console.log(`debug mode is now ${isDebugMode ? 'on' : 'off'}`)
            readLineLoop()
            break

          case '.load':
            readLineInterface.question('Enter the file path: ', async (filePath) => {
              try {
                const file = await loadRelativeFile(filePath)

                codeStack.add(file)

                console.log(`File was loaded: ${filePath}\n`, file.split('\n').slice(0, 5).join('\n'), '\n...\n')
              } catch (e) {
                console.error('Error loading file:', e)
              } finally {
                readLineLoop()
              }
            })
            break

          default:
            const combinedStackCodeLines = [...codeStack.entries()]
              .flatMap(([i, code]) => code.split('\n'))

            let lineNumber, inputCode
            if (/^#(\d+)$/.test(input)) {
              lineNumber = parseInt(input.slice(1).trim(), 10) - 1

              if (lineNumber < 0 || lineNumber > combinedStackCodeLines.length - 1) {
                console.log(`Invalid line number: ${lineNumber + 1}`)
                readLineLoop()
                return
              }

              console.debug('combinedStackCodeLines:\n', combinedStackCodeLines, '\n', 'lineNumber:', lineNumber + 1, '\n')
              inputCode = combinedStackCodeLines[lineNumber]
            } else {
              inputCode = input
            }

            inputCode = inputCode.trim()

            if (inputCode.length < 1) {
              console.log('No input code was provided')
              readLineLoop()
              return
            }

            console.debug('inputCode:\n', inputCode, '\n', 'lineNumber:', lineNumber, '\n')

            const depsCodeLines = getLinesOfDepsCode(inputCode, /*lineNumber*/ undefined, combinedStackCodeLines)
              .filter(Boolean)

            const handledInputCode = handleInputToGetPrint(inputCode)

            console.debug('depsCodeLines:\n', depsCodeLines, '\n')

            const executableCode = depsCodeLines.join('\n') + '\n' + handledInputCode

            const sourceTextModule = new vm.SourceTextModule(executableCode, { context })
            await sourceTextModule.link(async (specifier, referencingModule) =>
              new vm.SourceTextModule(await loadRelativeFile(specifier), { context: referencingModule.context }))
            await sourceTextModule.evaluate()

            codeStack.add(inputCode)

            readLineLoop()
            break
        }
      } catch (e) {
        console.error('there was an error:', e)
        readLineLoop()
      }
    })
})()
