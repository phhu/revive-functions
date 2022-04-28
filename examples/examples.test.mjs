import { spawnSync } from 'child_process'
import { expect } from 'chai'
/* global it,describe, */ //  beforeEach, afterEach

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
    sum: 44,
    twoWaysOfChainingFunctions: {
      tomorrow: '2022-04-29',
      yesterday: '2022-04-27'
    },
    unchanged: {
      string: 'other values get passed through',
      array: [1, 2, 3]
    }
  },
  example3: [{ something: 42 }, { something: 43 }]
}

describe('examples', () => {
  examples.forEach(name => {
    it(`${name} works`, () => {
      expect(getOutput(`${name}.mjs`)).to.deep.equal(output[name])
    })
  })
})
