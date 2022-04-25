A reviver function for Javascript's JSON.parse, allowing specified functions to be substituted for their output in a JSON-like structure.

This is useful for allowing set functions to be applied in a JSON-like structure at runtime. For example, `{added: {$add: [2,3]}, unchanged: 4}` could be converted to `{added: 5, unchanged: 4}`. An optional data object can be provided, allowing partially applied (curried) functions to use it as their last argument.

# Synopsis

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
  * `functions` is an object containing key value pairs of function names and function bodies. Defaults to `{}`
  * `addFunctionTag` is a function which, given a function name (e.g. `get`), returns a function tag (e.g. `$get`). Defaults to `name=>"$"+name`, i.e. useing "$" as a function tag.
  * `stringifyFirst`: for `reviveFunctionsInObject` and `reviveFunctionsInObjectCurried`, allows explicit determination of whether to run `JSON.stringify` on the input value, before passing to `JSON.parse`. Defaults to `undefined`, meaning this is done on objects only.
* `data` an optional Javascript value to be passed as a curried last argument to `functions`
* `jsonLikeObject` is a JSON-like Javascript structure, or a string containing valid JSON, in objects containing function specifications like `{$functionname: [param1, param2, ...]}` will be substituted with the result of calling the function with the specified parameters (and, optionally, the data object, applied as a last, curried argument). If only one parameter is needed, the array can be omitted (e.g. `{$functionname: param1}`). Parameters can be generated recursively, from nested function calls (see examples below).
* `jsonString` is a string as would normally be passed to JSON.parse

# Examples

```js
import { 
  reviveFunctions, 
  reviveFunctionsInObject, 
  reviveFunctionsInObjectCurried, 
} from 'revive-functions'

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

// Without use JSON.parse, change the function prefix to fn:: ,
// and use nested functions
const res2 = reviveFunctionsInObject({ 
    functions: {
      add: (x,y) => x + y,
      get: label => x => x[label]
    },
    addFunctionTag: f => 'fn::' + f,
  }, 
  {sum: {"fn::add":[2,{"fn::get": "test"}]}}, 
  {test: 42}
);
// {sum: 44}

// use a curried structure.
// stringifyFirst defaults undefined, which does auto-detection of 
// whether an object or a
// string is passed in, using JSON.stringify on the former only.
// Set a boolean to control it explicitly
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

See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse for details of `JSON.parse` and its reviver function parameter.