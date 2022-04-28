/*
EXAMPLE 2: Use `reviveFunctions` directly with JSON.parse with a data argument.
Note that getFromData is a curried function, with the data last.
When a function has no arguments, use an empty array, either with or without data.
*/

import { reviveFunctions } from 'revive-functions'

const example2 = JSON.parse(
  `{
    "example using data":{"$getFromData": "test"},
    "without data": {"$sayHelloTo": "Steve"},
    "no arguments": {"$firstDay": []},
    "no arguments, with data": {"$firstDayTest": []}
  }`,
  reviveFunctions(
    {
      functions: {
        getFromData: prop => data => data[prop],
        sayHelloTo: name => `Hello ${name}`,
        firstDay: () => new Date(0).toISOString(),   // safest to return string
        firstDayTest: () => ({test}) => new Date(test)    // can also return Date object
      }
    },
    { test: 42 }
  )
)

console.log(JSON.stringify(example2,null,2))
/*
{
  "example using data": 42,
  "without data": "Hello Steve",
  "no arguments": "1970-01-01T00:00:00.000Z",
  "no arguments, with data": "1970-01-01T00:00:00.042Z"
}
*/