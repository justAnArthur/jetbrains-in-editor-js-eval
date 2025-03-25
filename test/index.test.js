import { spawn } from 'child_process'
import path from 'node:path'
import assert from 'node:assert'

const SOLUTION_PATH = path.join('solution.js')

export function createProcess() {
  const proc = spawn('node', [SOLUTION_PATH, '--experimental-vm-modules'])
  let output = ''
  let current = ''

  proc.stdout.on('data', (data) => {
    console.log('in stdout.on', data.toString())
    current = data.toString()
    output += current
  })

  proc.stderr.on('data', (data) => {
  })

  proc.on('exit', () => {
    console.log('exited')
  })

  return { proc, outputRef: () => output, currentRef: () => current }
}

describe('run', () => {
  it('should output', function (done) {
    const { proc, outputRef } = createProcess()
    after(() => proc.kill())

    setTimeout(() => {
      console.log('outputRef()', outputRef())
      assert(outputRef().includes('>'))
      done()
    }, 100)
  })

  it('should print help', function (done) {
    const { proc, outputRef } = createProcess()
    after(() => proc.kill())

    setTimeout(() => {
      proc.stdin.write('.help\n')
    }, 200)

    setTimeout(() => {
      assert(outputRef().includes('display this help'))
      done()
    }, 600)
  })
})
