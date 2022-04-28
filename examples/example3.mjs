/*
EXAMPLE 3: Use a curried structure with `reviveFunctionsInObjectCurried`.
Useful for working with an array of objects (collection).
Also change the function tag to use "fn::" convention (like AWS).
*/

import { reviveFunctionsInObjectCurried } from 'revive-functions'

const reviver = reviveFunctionsInObjectCurried({
  functions: {
    get: label => x => x[label]
  },
  getFunctionTag: f => 'fn::' + f,
  stringifyFirst: true // superfluous, but possible in case we JSON which could be just a string
}
)({
  something: { 'fn::get': 'test' }
})

const data = [
  { test: 42 },
  { test: 43 }
]

const example3 = data.map(reviver)

console.log(JSON.stringify(example3))
// [ { something: 42 }, { something: 43 } ]
