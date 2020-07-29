import * as cycle from 'cycle'
import { JsonOptions } from './JsonOptions'
import { Options } from './Options'
import { jsonDefaultOptions } from './jsonDefaultOptions'
import { internalReviver } from './internalReviver'

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
|    /*...*/
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
        } else { // options.setSchema === false
          return [...value]
        }
      } else
      if (value instanceof Map) {
        if (options.mapSchema === '$map') {
          return { $map: [...value] }
        } else { // options.mapSchema === false
          return [...value]
        }
      } else
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

  private reviver(reviver?: Reviver): Reviver {
    const iReviver = internalReviver(this.#options.parse)
    if (reviver) {
      return function reviverHelper(this: any, key: string, value: any) {
        const data = reviver.call(this, key, value)
        if (data !== value) {
          return data
        }
        return iReviver.call(this, key, value)
      }
    }
    return iReviver
  }
}
