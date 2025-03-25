import { createProcess } from "./index.test.js"
import assert from "node:assert"

describe('arithmetic', () => {
  it('should solve basic', () => {
    const { proc, outputRef } = createProcess()
    after(() => proc.kill())

    setTimeout(() => {
      proc.stdin.write('2 + 2 - 2 * 2 - (2^2) \n')
    }, 200)

    setTimeout(() => {
      assert(outputRef().includes('0'))
    }, 600)
  })

  it('should solve complex', () => {
    const { proc, outputRef } = createProcess()
    after(() => proc.kill())

    setTimeout(() => {
      proc.stdin.write('7 * (2 + 5) / (7 - 4) + 2^3')
    }, 200)

    setTimeout(() => {
      assert(outputRef().includes('17'))
    }, 600)
  })
})
