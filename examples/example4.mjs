/*
EXAMPLE 4: Use a curried structure with `reviveFunctionsInObjectCurried`.
Useful for working with an array of objects (collection).
Also change the function tag to use "fn::" convention (like AWS).

Specifying stringifyFirst as true (or false) is generally superfluous,
but might be useful in some cases, perhaps if the JSON like object
might be a plain string.
*/

import { reviveFunctionsInObjectCurried } from 'revive-functions'

const reviver = reviveFunctionsInObjectCurried({
  functions: {
    get: label => x => x[label]
  },
  getFunctionTag: f => 'fn::' + f,
  stringifyFirst: true
}
)({
  something: { 'fn::get': 'test' }
})

const data = [
  { test: 42 },
  { test: 43 }
]

const example4 = data.map(reviver)

console.log(JSON.stringify(example4))
/*
[
  { something: 42 },
  { something: 43 }
]
*/
