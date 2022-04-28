import { spawnSync } from 'child_process'
import { expect } from 'chai'
import { add as dateAdd, format } from 'date-fns/fp/index.js'
import { pipe } from 'ramda'
/* global it,describe */

const offSetFromToday = pipe(
  days => dateAdd({ days }, new Date()),
  format('yyyy-MM-dd')
)
const getOutput = cmd => {
  const child = spawnSync('node', [cmd], { encoding: 'utf8' })
  if (child.error) { console.log('ERROR: ', cmd, child.error) }
  return JSON.parse(child.stdout)
}
const examples = [1, 2, 3, 4].map(x => `example${x}`)

const output = {
  example1: {"example":"example value"},
  example2: {
    "example using data": 42,
    "without data": "Hello Steve",
    "no arguments": "1970-01-01T00:00:00.000Z",
    "no arguments, with data": "1970-01-01T00:00:00.042Z"
  },
  example3: {
    "sum": 44,
    "twoWaysOfChainingFunctions": {
      "tomorrow": offSetFromToday(1),
      "yesterday": offSetFromToday(-1),
      "someWhileAgo": offSetFromToday(-42)
    },
    "unchanged": {
      "string": "other values get passed through",
      "array": [
        1,
        2,
        3
      ]
    }
  },
  example4: [{ something: 42 }, { something: 43 }]
}

describe('Examples', () => {
  examples.forEach(name => {
    it(`${name} works`, () => {
      expect(getOutput(`${name}.mjs`)).to.deep.equal(output[name])
    })
  })
})
