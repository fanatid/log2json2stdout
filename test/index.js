const { EOL } = require('os')
const test = require('tape')
const logger = require('../lib')

test('json2stdout', (t) => {
  const stdoutWrite = process.stdout.write
  const wrap = (fn) => (t) => {
    let output = ''

    process.stdout.isTTY = false
    process.stdout.write = (t) => { output += t }
    const rollback = () => {
      process.stdout.isTTY = true
      process.stdout.write = stdoutWrite
    }

    try {
      fn(t, () => {
        rollback()
        return output
      })
    } finally {
      rollback()
    }
  }

  t.test('simple', wrap((t, getOutput) => {
    logger.info('hello')
    logger('error', { x: 42, message: 'world' })

    const items = getOutput().split(EOL)
    t.equal(items.length, 3)
    t.equal(items[2], '')

    const obj1 = JSON.parse(items[0])
    t.same(obj1, { timestamp: obj1.timestamp, level: 'info', message: 'hello' })

    const obj2 = JSON.parse(items[1])
    t.same(obj2, { timestamp: obj2.timestamp, level: 'error', message: 'world', x: 42 })

    t.end()
  }))

  t.end()
})
