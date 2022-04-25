import { reviveFunctions, reviveFunctionsCurried} from './revive-functions.mjs'
import { expect } from 'chai'
import sinon from 'sinon'

const functions = {
  date: x => new Date(x === undefined ? Date.now() : x),
  get: (label, x) => x[label],
  getCurried: label => x => x[label],
  always: val => x => val,
  add: (x, y) => x + y
}

const obj = {
  someGet: { $get: ['test', { test: 1 }] },
  getCurriedFromData: [
    { $getCurried: 'test' },
    { $getCurried: ['test'] }
  ],
  someDates: { fixed: { $date: ['01-01-2020'] }, now: { $date: [] } },
  recursiveArgs: {
    $get: [
      { $always: 'test' }, { $always: [{ test: { $always: 3 } }] }
    ]
  },
  always: { $always: 'unchanged' },
  added: { $add: [1, { $add: [2, 3.1] }] },
  invalidFuncName: { $invalid: 'fakearg' },
  literals: [1, -1.23, 'string', '$string', null, undefined, false, true, [], , [[]], {}, { p: 'val' }]
}
const data = { test: 2 }

const target = {
  someGet: 1,
  getCurriedFromData: [2, 2],
  someDates: { fixed: new Date('2020-01-01T00:00:00.000Z'), now: new Date() },
  recursiveArgs: 3,
  always: 'unchanged',
  added: 6.1,
  invalidFuncName: { $invalid: 'fakearg' },
  literals: [
    1, -1.23, 'string', '$string',
    null, null, false, true,
    [], null, [[]], {}, { p: 'val' }
  ]
}

const now = new Date()
let clock
beforeEach(() => { clock = sinon.useFakeTimers(now.getTime());  });
afterEach(() => {  clock.restore(); });

describe('it works', () => {
  it('reviveFunctions  works', () => {    
    const actual = reviveFunctions({functions}, obj, data)
    expect(actual).to.deep.equal(target)
  })
  it('reviveFunctions works with stringified', () => {
    const actual = reviveFunctions({functions}, JSON.stringify( obj), data)
    expect(actual).to.deep.equal(target)
  })
  it('reviveFunctionsCurried works', () => {
    const actual = reviveFunctionsCurried({functions})(obj)(data)
    expect(actual).to.deep.equal(target)
  })
})
