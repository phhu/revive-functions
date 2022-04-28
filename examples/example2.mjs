/*
EXAMPLE 2: Using `reviveFunctionsInObject`, which hides the call to `JSON.parse`. Here functions are injected from ramda and date-fns.
Note that functions can be combined in the JSON-like-object ($tomorrow)
or in the functions object ($yesterday).
Also note that all non-function-tag elements are passed through unchanged.
*/

import { reviveFunctionsInObject } from 'revive-functions'
import { prop, pipe } from 'ramda'
import { add as dateAdd, format } from 'date-fns/fp/index.js'

const example2 = reviveFunctionsInObject({
  functions: {
    add: (x, y) => x + y,
    get: prop,
    today: () => Date.now(),
    dateAdd,
    format,
    dateOffsetDays: pipe(
      days => dateAdd({ days }, new Date()),
      format('yyyy-MM-dd')
    )
  }
},
{
  sum: { $add: [2, { $get: 'test' }] },
  twoWaysOfChainingFunctions: {
    tomorrow: { $format: ['yyyy-MM-dd', { $dateAdd: [{ days: 1 }, { $today: [] }] }] },
    yesterday: { $dateOffsetDays: -1 }
  },
  unchanged: { string: 'other values get passed through', array: [1, 2, 3] }
},
{ test: 42 }
)

console.log(JSON.stringify(example2, null, 2))

/*
{
  "sum": 44,
  "twoWaysOfChainingFunctions": {
    "tomorrow": "2022-04-29",
    "yesterday": "2022-04-27"
  },
  "unchanged": {
    "string": "other values get passed through",
    "array": [
      1,
      2,
      3
    ]
  }
}
*/
