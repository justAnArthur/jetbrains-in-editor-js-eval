import fs from 'fs'
import readline from 'readline'
import { parse } from "acorn"
import { base, recursive } from "acorn-walk"
import vm from "node:vm"

const filePath = 'example.hard.js'
const fileContent = fs.readFileSync(filePath, 'utf-8')
const fileLines = fileContent.split(/\r?\n/)
//console.log('$', { fileLines })

// # ---

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function promptUser() {
  rl.question('Enter input: \n', async (input) => {
    switch (input.toLowerCase()) {
      case 'exit':
        rl.close()
        break

      default:
        let lineNumber, code
        if (/^#(\d+)$/.test(input)) {
          lineNumber = parseInt(input.slice(1), 10)

          //console.log('$', { lineNumber })

          if (lineNumber < 1 || lineNumber > fileLines.length) {
            //console.log(`Invalid line number: ${lineNumber}`)
            promptUser()
            return
          }
        } else
          code = input

        try {
          let inputCode = !lineNumber ? code : fileLines[lineNumber - 1]
          const inputCodeAst = parse(inputCode, { ecmaVersion: "latest", sourceType: "script" })

          if (inputCodeAst.body[0].type === "ExpressionStatement")
            inputCode = `print(${inputCode})`

          const depsCode = getLinesOfDepsOfCode(code, lineNumber)

          const executableCode = depsCode.filter(Boolean).join('\n') + '\n' + inputCode

          //console.log('$', { executableCode })

          const context = vm.createContext({ print: console.log })

          // console.log('$', { executableCode })
          console.time("ast")
          const sourceTextModule = new vm.SourceTextModule(executableCode, { context })
          await sourceTextModule.link((specifier, referencingModule) => {
            return new vm.SourceTextModule(fs.readFileSync(specifier, 'utf-8'), { context: referencingModule.context })
          })
          await sourceTextModule.evaluate()
          console.timeEnd("ast")

          const plainCode = fileLines.join('\n') + '\n' + inputCode
          // console.log('$', { plainCode })
          console.time("plain")
          const _sourceTextModule = new vm.SourceTextModule(plainCode, { context })
          await _sourceTextModule.link((specifier, referencingModule) => {
            return new vm.SourceTextModule(fs.readFileSync(specifier, 'utf-8'), { context: referencingModule.context })
          })
          await _sourceTextModule.evaluate()
          console.timeEnd("plain")

          if (!lineNumber)
            fileLines.push(input)
        } catch (e) {
          console.error(e)
        }

        promptUser()
    }
  })
}

promptUser()

function getLinesOfDepsOfCode(code, lineNumber, { ignoredDeps = [] } = {}) {
  const deps = []

  if (!code && lineNumber)
    code = fileLines[lineNumber - 1]

  //console.log('$', { code })

  const ast = parse(code, { ecmaVersion: "latest", sourceType: "script" })

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

  //console.log('$', { deps })

  let depsCode = []

  for (const dep of deps) {
    if (ignoredDeps.includes(dep))
      continue

    //console.log('$', { dep })

    for (let i = (lineNumber || fileLines.length) - 1; i >= 0; i--) {
      let code = fileLines[i]

      let isDeclaration = false

      let isImport = false

      let isRelevant = false
      let _endFunctionIndex

      if (code.includes('}') && !code.includes('import')) {
        let inner = 0
        _endFunctionIndex = i
        while (i >= 0) {
          //console.log('$', { i }, { code })

          if (fileLines[i].includes('{')) {
            inner -= 1
          }

          if (fileLines[i].includes('}')) {
            inner += 1
          }

          if (inner === 0) {
            code = fileLines.slice(i, _endFunctionIndex + 1).join('\n')
            break
          }

          i--
        }
      }

      //console.log('$', { i }, { code })

      const ast = parse(code, { ecmaVersion: "latest", sourceType: "module" })

      const visitors = {
        VariableDeclaration(node, state, c) {
          //console.log('$', 'variable declaration', { code }, node.declarations)
          for (const decl of node.declarations) {
            if (decl.id.name === dep) {
              // //console.log('$==', decl.id.name, dep)
              isDeclaration = true
              isRelevant = true
              break
            }
          }
        },
        AssignmentExpression(node) {
          if (node.left.name === dep) {
            // //console.log('$==', node.left.name, dep)
            isRelevant = true
          }
        },
        UpdateExpression(node) {
          if (node.argument.name === dep) {
            // //console.log('$==', node.argument.name, dep)
            isRelevant = true
          }
        },
        FunctionDeclaration(node) {
          if (node.id.name === dep) {
            // //console.log('$==', node.id.name, dep)
// Ignore function parameters
            for (const param of node.params) {
              if (param.type === "Identifier") {
                ignoredDeps.push(node)
              }
            }
            isRelevant = true
          }
        },
        ImportDeclaration(node) {
          for (const specifier of node.specifiers) {
            if (specifier.local.name === dep) {
              // //console.log('$==', specifier.local.name, dep)
              isRelevant = true
              isImport = true
            }
          }
        }
      }
      recursive(ast, null, visitors, base)

      if (!isRelevant)
        continue

      depsCode[i] = code
      let _code = code

      if (_endFunctionIndex !== undefined) {
        _code = fileLines.slice(i + 2, _endFunctionIndex).join('\n')
        _code = _code.replace('return ', '')
        //console.log('$', { dep, _code })
      }

      if (isImport)
        continue

      const _i = i
      const innerDepsCode = getLinesOfDepsOfCode(_code, _i, { ignoredDeps: [dep, ...ignoredDeps] })

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
