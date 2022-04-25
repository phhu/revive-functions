// export const reviveFunctions = ({
//     functions = { }, /* e.g add: (x,y) => x+y */
//     addFunctionTag = f => '$' + f,
//   } = {},
//   data=undefined
// ) => function reviveFunctionsInner (key, item) {
//   if (typeof item === 'object' && item != null && !Array.isArray(item)) {
//     const [firstKey, args] = Object.entries(item)?.[0] ?? []
//     const func = Object.entries(functions)
//       .find(([key, f]) => addFunctionTag(key) === firstKey)
//       ?.[1]
//     if (firstKey && func && Object.keys(item).length === 1) {
//       const funcRes = func( // call the function
//         ...(
//           [].concat(args) // allow single arg without array
//             .map(arg => reviveFunctionsInner(null, arg)) // argument recursion
//         )
//       )
//       // optional data as curried last argument:
//       return typeof (funcRes) === 'function' ? funcRes(data) : funcRes
//     }
//   };
//   return item // default to unmodified
// }

export const reviveFunctionsMain = ({
    functions = { }, /* e.g add: (x,y) => x+y */
    addFunctionTag = f => '$' + f
  } = {},
  data = undefined
) => function reviveFunctionsInner (key, item) {
  if (typeof item === 'object' && item != null && !Array.isArray(item)) {
    const [firstKey, args] = Object.entries(item)?.[0] ?? []
    const func = Object.entries(functions)
      .find(([key, f]) => addFunctionTag(key) === firstKey)
      ?.[1]
    if (firstKey && func && Object.keys(item).length === 1) {
      const funcRes = func( // call the function
        ...(
          [].concat(args) // allow single arg without array
            .map(arg => reviveFunctionsInner(null, arg)) // argument recursion
        )
      )
      // optional data as curried last argument:
      return typeof (funcRes) === 'function' ? funcRes(data) : funcRes
    }
  };
  return item // default to unmodified
}

export const reviveFunctions = ({
    functions = { /* e.g add: (x,y) => x+y */ },
    addFunctionTag = f => '$' + f,
    stringifyFirst = undefined
  } = {}, 
  jsonLikeObject = {}, 
  data = undefined
) => {
  if (Object.keys(functions).length === 0 ){console.warn("Warning: ReviveFucntions: No functions provided")}
  console.log(typeof jsonLikeObject)
  return JSON.parse(
    (stringifyFirst || (typeof jsonLikeObject === "object" && stringifyFirst == undefined))
      ? JSON.stringify(jsonLikeObject) : jsonLikeObject,
    reviveFunctionsMain({ functions, addFunctionTag }, data)
  )
}

export const reviveFunctionsCurried = (spec = {}) => 
  jsonLikeObject => data => reviveFunctions(spec, jsonLikeObject, data)