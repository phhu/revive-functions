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
  console.log('output', cmd, child.stdout)
  return JSON.parse(child.stdout)
}
const examples = [1, 2, 3].map(x => `example${x}`)

const output = {
  example1: { something: 42 },
  example2: {
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
  example3: [{ something: 42 }, { something: 43 }]
}

describe('Examples', () => {
  examples.forEach(name => {
    it(`${name} works`, () => {
      expect(getOutput(`${name}.mjs`)).to.deep.equal(output[name])
    })
  })
})
