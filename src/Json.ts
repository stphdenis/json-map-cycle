import * as cycle from 'cycle'
import { JsonOptions } from './JsonOptions'
import { Options } from './Options'
import { jsonDefaultOptions } from './jsonDefaultOptions'

type Reviver = (this: any, key: string, value: any) => any
type Replacer = (this: any, key: string, value: any) => any

export class Json {
  private static _json: Json = new Json()
  static parse(text: string, reviver?: Reviver): any {
    return this._json.parse(text, reviver)
  }
  static setOptions(options: JsonOptions) {
    this._json.setOptions(options)
  }
  static stringify(value: any, replacer?: Replacer|null, space?: string|number): string {
    return this._json.stringify(value, replacer, space)
  }

  #options: Options
  #removeComments = /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g

  constructor(options?: JsonOptions) {
    this.#options = {
      stringify: {...jsonDefaultOptions.stringify},
      parse: {...jsonDefaultOptions.parse},
    }

    if (options) {
      this.setOptions(options)
    }
  }

  setOptions(options: JsonOptions) {
    Object.assign(this.#options.stringify, options.stringify)
    Object.assign(this.#options.parse, options.parse)
  }

  stringify(value: any, replacer?: Replacer|null, space?: string|number): string {
    let data: string
    if (this.#options.stringify.decycle) {
      data = JSON.stringify(cycle.decycle(value), this.replacer(replacer), space)
    } else {
      data = JSON.stringify(value, this.replacer(replacer), space)
    }
    if (replacer && data === undefined) {
      throw new Error(`A replacer must always return a value

Verify your 'replacer' return a 'value' like this :
|  procedure replace(this, key, value) {
|   ...
|    return value
|  }
`);
    }
    return data
  }

  private replacer(replace?: Replacer|null): (this: any, key: string, value: any) => any {
    const that = this
    /**
     * Eliminate recursion referencing the types
     */
    function replacer(this: any, key: string, value: any): any {
      const options = that.#options.stringify
      if (value instanceof Set) {
        if (options.setSchema === '$set') {
          return { $set: [...value] }
        } else { // options.setSchema === 'array'
          return [...value]
        }
      }
      if (value instanceof Map) {
        if (options.mapSchema === '$map') {
          return { $map: [...value] }
        } else { // options.mapSchema === 'array'
          return [...value]
        }
      }
      if (value instanceof Date) {
        if (options.dateSchema === '$date') {
          if (options.dateFormat === 'JSON') {
            return { $date: value.toJSON() }
          } else { // options.dateFormat === 'UTC'
            return { $date: value.toUTCString() }
          }
        } else {
          if (options.dateFormat === 'JSON') {
            return value.toJSON()
          } else { // options.dateFormat === 'UTC'
            return value.toUTCString()
          }
        }
      }
      return value
    }

    if (replace) {
      return function replacerHelper(this: any, key: string, value: any) {
        const data = replace.call(this, key, value)
        if (data !== value) {
          return data
        }
        return replacer.call(this, key, value)
      }
    }
    return replacer
  }

  parse(text: string, reviver?: Reviver) {
    if (this.#options.parse.removeComments) {
      const textNoComment = text.replace(this.#removeComments, (m, g) => g ? "" : m)
      return this.parseWithoutComments(textNoComment, reviver)
    }
    return this.parseWithoutComments(text, reviver)
  }

  private parseWithoutComments(text: string, reviver?: Reviver) {
    if (this.#options.parse.retrocycle) {
      return cycle.retrocycle(JSON.parse(text, this.reviver(reviver)))
    } else {
      return JSON.parse(text, this.reviver(reviver))
    }
  }

  private reviver(revive?: Reviver): Reviver {
    const that = this
    function reviver(this: any, key: string, value: any) {
      if (key && value &&
        typeof value === 'object' &&
        value instanceof Array === false
      ) {
        const options = that.#options.parse
        if (options.setSchema === '$set' && value['$set']) return new Set(value['$set'])
        if (options.setStringKeys?.includes(key)) return new Set(value)
        if (options.setRegexKeys?.test(key)) return new Set(value)

        if (options.mapSchema === '$map' && value['$map']) return new Map(value['$map'])
        if (options.mapStringKeys?.includes(key)) return new Map(value)
        if (options.mapRegexKeys?.test(key)) return new Map(value)

        if (options.dateType === 'Date') {
          if (options.dateSchema.includes('$date') && value['$date']) {
            return new Date(value['$date'])
          }
          if (options.dateStringKeys?.includes(key)) {
            return new Date(value)
          }
          if (options.dateRegexKeys?.test(key)) {
            return new Date(value)
          }
          // YYYY-MM-DDTHH:mm:ss.sssZ | Ddd, JJ Mmm YYYY HH:mm:ss GMT
          if (options.dateSchema.includes('JSON&UTC') &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$|^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value)
          ) {
            return new Date(value)
          }
        } else {
          if (options.dateSchema.includes('$date') && value['$date']) {
            return value['$date']
          }
        }
      }
      return value
    }

    if (revive) {
      return function reviverHelper(this: any, key: string, value: any) {
        const data = revive.call(this, key, value)
        if (data !== value) {
          return data
        }
        return reviver.call(this, key, value)
      }
    }
    return reviver
  }
}
