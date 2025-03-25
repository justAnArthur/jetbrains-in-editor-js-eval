import { createProcess } from "./index.test.js"
import assert from "node:assert"

describe('stack', () => {
  it('should work with stack', () => {
    const { proc, outputRef } = createProcess()
    after(() => proc.kill())

    setTimeout(() => {
      proc.stdin.write('const a = 2\n')
      proc.stdin.write('const b = 3\n')
      proc.stdin.write('const c = 4\n')
      proc.stdin.write('const d = a + b * c\n')
      proc.stdin.write('d\n')
    }, 200)

    setTimeout(() => {
      assert(outputRef().includes('14'))
    }, 600)
  })

  it('should work with stack functions', () => {
    const { proc, outputRef } = createProcess()
    after(() => proc.kill())

    setTimeout(() => {
      proc.stdin.write('function add(a, b) {\n  return a + b\n }\n')
      proc.stdin.write('add(2, 3)\n')
    }, 200)

    setTimeout(() => {
      assert(outputRef().includes('5'))
    }, 400)
  })

  it('should redeclare', () => {
    const { proc, outputRef } = createProcess()
    after(() => proc.kill())

    setTimeout(() => {
      proc.stdin.write('const a = 2\n')
      proc.stdin.write('const a = 3\n')
      proc.stdin.write('a\n')
    }, 200)

    setTimeout(() => {
      assert(outputRef().includes('3'))
    }, 400)
  })
})
