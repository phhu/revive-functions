A reviver function for Javascript's JSON.parse, allowing specified functions to be substituted for their output in a JSON-like structure.

This is useful for allowing set functions to be applied in a JSON-like structure at runtime. For example:

`{added: {$add: [2,3]}, unchanged: 4}` 

...could be converted to...

`{added: 5, unchanged: 4}`. 

An optional data object can be provided, allowing partially applied (curried) functions to use it as their last argument.

## Synopsis

```js
npm install revive-functions

import { 
  reviveFunctions, 
  reviveFunctionsInObject, 
  reviveFunctionsInObjectCurried, 
} from 'revive-functions'

JSON.parse(jsonString, reviveFunctions(options, data))
reviveFunctionsInObject(options, jsonLikeObject, data)
reviveFunctionsInObjectCurried(options)(jsonLikeObject)(data)
```

* `options` is an object with three keys:
  * `functions` is an object containing key value pairs of function names and function bodies. Defaults to `{}`. It can be useful to pass selected functions from libraries such as Ramda, lodash/fp, or date-fns.
  * `getFunctionTag` is a function which, given a function name (e.g. `myfunc`), returns a function tag (e.g. `$myfunc`). Defaults to `name=>"$"+name`, i.e. using "$" as a function tag.
  * `stringifyFirst`: for `reviveFunctionsInObject` and `reviveFunctionsInObjectCurried`, allows explicit determination of whether to run `JSON.stringify` on the input value, before passing to `JSON.parse`. Defaults to `undefined`, meaning this is done on objects only.
* `data` an optional Javascript value to be passed as a curried last argument to `functions`
* `jsonLikeObject` is a JSON-like Javascript structure, or a string containing valid JSON, in which objects containing function specifications like `{$functionname: [param1, param2, ...]}` will be substituted with the result of calling the function with the specified parameters (and, optionally, the data object, applied as a last, curried argument). If only one parameter is needed, the array can be omitted (e.g. `{$functionname: param1}`). Parameters can be generated recursively, from nested function calls (see examples below). The whole JSON-like tree is parsed. Items which are not recognised as function specifications are passed through unchanged, as per normal `JSON.parse` behaviour.
* `jsonString` is a string as would normally be passed to `JSON.parse`

## Examples

EXAMPLE 1: Use `reviveFunctions` directly with JSON.parse:
```js
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

```

EXAMPLE 2: Use `reviveFunctions` directly with JSON.parse with a data argument.
Note that getFromData is a curried function, with the data last.
When a function has no arguments, use an empty array, either with or without data.

```js
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
        firstDay: () => new Date(0).toISOString(),      // safest to return string
        firstDayTest: () => ({test}) => new Date(test)  // can also return Date object
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
```

EXAMPLE 3: Using `reviveFunctionsInObject`, which hides the call to `JSON.parse`. 
Here functions are injected from ramda and date-fns.
Note that functions can be combined in the JSON-like-object ($tomorrow)
or in the functions object ($yesterday), possibly using values from `data` (someWhileAgo).
Also note that all non-function-tag elements are passed through unchanged.
```js

import { reviveFunctionsInObject } from 'revive-functions'
import { prop, pipe } from 'ramda'
import { add as dateAdd, format } from 'date-fns/fp/index.js'

const example3 = reviveFunctionsInObject(
  {
    functions: {
      add: (x, y) => x + y,
      get: prop,
      today: () => Date.now(),
      dateAdd,
      format,
      dateOffsetDays: pipe(
        days => dateAdd({ days }, new Date()),
        format('yyyy-MM-dd')
      ),
      negate: x=> -x,
    }
  },
  {
    sum: { $add: [2, { $get: 'test' }] },
    twoWaysOfChainingFunctions: {
      tomorrow: { $format: ['yyyy-MM-dd', { $dateAdd: [{ days: 1 }, { $today: [] }] }] },
      yesterday: { $dateOffsetDays: -1 },
      someWhileAgo: { $dateOffsetDays: { $negate: { $get: 'test' } } }
    },
    unchanged: { string: 'other values get passed through', array: [1, 2, 3] }
  },
  { test: 42 }     // data object
)

console.log(JSON.stringify(example3, null, 2))

/*
{
  "sum": 44,
  "twoWaysOfChainingFunctions": {
    "tomorrow": "2022-04-29",
    "yesterday": "2022-04-27",
    "someWhileAgo": "2022-03-17"
  },
  "unchanged": {
    "string": "other values get passed through",
    "array": [1, 2, 3]
  }
}
*/

```
EXAMPLE 4: Use a curried structure with `reviveFunctionsInObjectCurried`.
Useful for working with an array of objects (collection).
Also change the function tag to use "fn::" convention (like AWS).

Specifying stringifyFirst as true is superfluous, 
but might be useful in some cases, perhaps if the JSON like object 
might be a plain string.
```js
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

```

## References

See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse for details of `JSON.parse` and its reviver function parameter.

See https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference.html for an example of this kind of substitution being used in Amazon Web Services (AWS) Cloudformation.

NPM: https://www.npmjs.com/package/revive-functions