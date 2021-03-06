import {
  reviveFunctions,
  reviveFunctionsInObject,
  reviveFunctionsInObjectCurried
} from './revive-functions.mjs'

import { expect } from 'chai'
import sinon from 'sinon'

/* global it,describe, beforeEach, afterEach */

const functions = {
  date: x => new Date(x === undefined ? Date.now() : x),
  get: (label, x) => x[label],
  getCurried: label => x => x[label],
  always: val => x => val,
  add: (x, y) => x + y
}

const objNoData = { get: { $get: ['test', { test: 1 }] } }
const targetNoData = { get: 1 }
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
  literals: [1, -1.23, 'string', '$string', null, undefined, false, true, [], [[]], {}, { p: 'val' }]
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
    [], [[]], {}, { p: 'val' }
  ]
}

// use sinon to mock live dates
const now = new Date()
let clock
beforeEach(() => { clock = sinon.useFakeTimers(now.getTime()) })
afterEach(() => { clock.restore() })

describe('reviveFunctions', () => {
  it('works with data', () => {
    const actual = JSON.parse(JSON.stringify(obj), reviveFunctions({ functions }, data))
    expect(actual).to.deep.equal(target)
  })
})

describe('reviveFunctionsInObject', () => {
  it('works with data', () => {
    const actual = reviveFunctionsInObject({ functions }, obj, data)
    expect(actual).to.deep.equal(target)
  })
  it('works without data', () => {
    const actual = reviveFunctionsInObject({ functions }, objNoData)
    expect(actual).to.deep.equal(targetNoData)
  })
  it('works with stringified object', () => {
    const actual = reviveFunctionsInObject({ functions }, JSON.stringify(obj), data)
    expect(actual).to.deep.equal(target)
  })
})

describe('reviveFunctionsInObjectCurried', () => {
  it('works', () => {
    const actual = reviveFunctionsInObjectCurried({ functions })(obj)(data)
    expect(actual).to.deep.equal(target)
  })
})

describe('bindDataToFunction', () => {
  const data = { someKey: 33 }
  const functions = {
    get: function (prop) { return this?.[prop] },
    getArrow: prop => this?.[prop]
  }
  const obj = {
    test: { $get: 'someKey' },
    testArrow: { $getArrow: 'someKey' }
  }
  it('works when true, with normal functions', () => {
    const actual = reviveFunctionsInObject({
      functions,
      bindDataToFunction: true
    }, obj, data)
    expect(actual).to.deep.equal({ test: 33 })
  })
  it('does not work when false', () => {
    const actual = reviveFunctionsInObject({
      functions,
      bindDataToFunction: false
    }, obj, data)
    expect(actual).to.deep.equal({})
  })
  it('does not work when not specified (defaults to false)', () => {
    const actual = reviveFunctionsInObject({
      functions
      //, bindDataToFunction:false
    }, obj, data)
    expect(actual).to.deep.equal({})
  })
})

describe('callFunctionsReturnedWithData', () => {
  const data = { someKey: 33 }
  const functions = {
    get: prop => data => data[prop]
  }
  const obj = {
    test: { $get: 'someKey' }
  }
  it('returns functions when false, and this function works as expected', () => {
    const actual = reviveFunctionsInObject({
      functions,
      callFunctionsReturnedWithData: false
    }, obj, data)
    expect(typeof actual.test).to.equal('function')
    expect(actual.test(data)).to.equal(33)
  })
})
