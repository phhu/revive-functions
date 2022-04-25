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
  * `functions` is an object containing key value pairs of function names and function bodies. Defaults to `{}`. It can be useful to pass selected functions from libraries such as Ramda or lodash/fp.
  * `addFunctionTag` is a function which, given a function name (e.g. `get`), returns a function tag (e.g. `$get`). Defaults to `name=>"$"+name`, i.e. using "$" as a function tag.
  * `stringifyFirst`: for `reviveFunctionsInObject` and `reviveFunctionsInObjectCurried`, allows explicit determination of whether to run `JSON.stringify` on the input value, before passing to `JSON.parse`. Defaults to `undefined`, meaning this is done on objects only.
* `data` an optional Javascript value to be passed as a curried last argument to `functions`
* `jsonLikeObject` is a JSON-like Javascript structure, or a string containing valid JSON, in which objects containing function specifications like `{$functionname: [param1, param2, ...]}` will be substituted with the result of calling the function with the specified parameters (and, optionally, the data object, applied as a last, curried argument). If only one parameter is needed, the array can be omitted (e.g. `{$functionname: param1}`). Parameters can be generated recursively, from nested function calls (see examples below). The whole JSON-like tree is parsed. Items which are not recognised as function specifications are passed through unchanged, as per normal `JSON.parse` behaviour.
* `jsonString` is a string as would normally be passed to `JSON.parse`

## Examples

```js
import { 
  reviveFunctions, 
  reviveFunctionsInObject, 
  reviveFunctionsInObjectCurried, 
} from 'revive-functions'
import { prop } from 'ramda'

// use directly with JSON.parse:
const res = JSON.parse(
  `{"something":{"$get": "test"}}`, 
  reviveFunctions({
      functions: {
        get: label => x => x[label]
      }
    },
    {test:42}
  )
);
// {something: 42}

// Without needing to invoke JSON.parse, changing the function prefix to fn:: ,
// using Ramda's prop as the get function, and using nested functions:
const res2 = reviveFunctionsInObject({ 
    functions: {
      add: (x,y) => x + y,
      get: prop  
    },
    addFunctionTag: f => 'fn::' + f,
  }, 
  {
    sum: {"fn::add": [2, {"fn::get": "test"}] },
    unchanged: "other values get passed through"
  }, 
  {test: 42}
);
// {sum: 44, unchanged: "other values get passed through"}

// using a curried structure against multiple data values, 
// and explicity, superfluously, 
// setting the object passed to be stringified first  
const reviver = reviveFunctionsInObjectCurried({ 
    functions: {
      get: label => x => x[label]
    },
    stringifyFirst: true   
  }
)({something: {"$get": "test"}});

const data = [
  {test:42},
  {test:43}
];
const res3 = data.map(reviver);
// [ { something: 42 }, { something: 43 } ]
```

## References

See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse for details of `JSON.parse` and its reviver function parameter.

See https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference.html for an example of this kind of substitution being used in Amazon Web Services (AWS) Cloudformation.

NPM: https://www.npmjs.com/package/revive-functions