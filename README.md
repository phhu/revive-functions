A reviver function for JSON.parse, allowing specified functions to be substituted for their output in a JSON-like structure.

```js
import { 
  reviveFunctions, 
  reviveFunctionsInObject, 
  reviveFunctionsInObjectCurried, 
} from './revive-functions.mjs'

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
  {test:42}
);
// {sum: 44}

// use a curried structure.
// stringifyFirst defaults undefined, which does auto-detection of 
// whether an object or a
// string is passed in, using JSON.stringify on the former only.
// Set a boolean to control is explicitly
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

console.log(res,res2,res3)
// { something: 42 } 
// { sum: 44 } 
// [ { something: 42 }, { something: 43 } ]

```

See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse for details of JSON.parse and its reviver function parameter.