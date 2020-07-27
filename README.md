# json-map-cycle

JSON library with `parse` and `stringify` for `Map`, `Set`, `Date`, `comments` (remove only) and manage `cycle`.

Use the default `JSON` package an has exactly the same signature than `JSON` from `Node`.

`replacer` and `reviver` can still be used.

`decycle` and `recycle` from package `cycle` are both optional.

Can be used as static or as an object with different parameters.

You can use `Json.setOptions({...})` when starting your app before using static form.

## stringify

Stringify `Map` to

- `{ anyKey: { "$map": [...] } }`
- `[...]`

Stringify `Set` to

- { anyKey: { "$set": [...] } }`
- `[...]`

Stringify `Date` for `JSON` or `UTC` format to

- `{ anyKey: { "$date": "..." } }`
- `"..."`

Can `decycle` the parsed object with `$ref` keys (off by default).

## parse

Remove comments by default

- // ...
- /\* ... \*/

Parse a `new Map()` from

- `{ anyKey: { "$map": [...] } }`
- `{ knownMapKeys: [...] }`
- `{ regexMapKeys: [...] }`

Parse a `new Set()` from

- `{ anyKey: { "$set": [...] } }`
- `{ knownSetKeys: [...] }`
- `{ regexSetKeys: [...] }`

Parse a `new Date()` from

- `{ anyKey: { "$date": "..." } }`
- `{ knownDateKeys: "..." }`
- `{ regexDateKeys: "..." }`

Can `recycle` the parsed object from `$ref` keys (on by default).

## Examples

With the static form :

```ts
import { Json } from 'json-map-cycle'

// replacer to decycle "of" keys to "$ref" a known type
function replacer(this: any, key: string, value: any): any {
  if(key && key === 'of') {
    return { $ref: `$[\"types\"][\"${value.name}\"]` }
  }
}
const jsonApiSchema = Json.stringify(apiSchema, replacer, 2)
```

With object form :

```js
import { Json } from 'json-map-cycle'

const json = new Json({
  ...opions...
})
const apiSchema = Json.parse(jsonApiSchema)
```
