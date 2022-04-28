/*
EXAMPLE 1: Use `reviveFunctions` directly with JSON.parse:
*/

import { reviveFunctions } from 'revive-functions'

const example1 = JSON.parse(`{
  "example":{"$get": ["test", {"test": "example value"} ] }
}`,
  reviveFunctions({
    functions: {
      get: (prop,x) => x[prop],
    }
  })
)

console.log(JSON.stringify(example1))
// {"example":"example value"}
