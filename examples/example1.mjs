/*
EXAMPLE 1: Use `reviveFunctions` directly with JSON.parse:
*/

import { reviveFunctions } from 'revive-functions'

const example1 = JSON.parse(
  '{"something":{"$get": "test"}}',
  reviveFunctions({
    functions: {
      get: label => x => x[label]
    }
  },
  { test: 42 }
  )
)

console.log(JSON.stringify(example1))
// {something: 42}
