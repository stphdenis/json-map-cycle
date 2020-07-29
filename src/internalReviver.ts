import { ParseOptions } from './JsonOptions'

export function internalReviver(parseOptions: ParseOptions) {
  return function reviver(this: any, key: string, value: any) {
    if (key && value &&
      typeof value === 'object' &&
      value instanceof Array === false
    ) {
      if (parseOptions.setSchema === '$set' && value['$set']) return new Set(value['$set'])
      if (parseOptions.setStringKeys?.includes(key)) return new Set(value)
      if (parseOptions.setRegexKeys?.test(key)) return new Set(value)

      if (parseOptions.mapSchema === '$map' && value['$map']) return new Map(value['$map'])
      if (parseOptions.mapStringKeys?.includes(key)) return new Map(value)
      if (parseOptions.mapRegexKeys?.test(key)) return new Map(value)

      if (parseOptions.dateType === 'Date') {
        if (parseOptions.dateSchema?.includes('$date') && value['$date']) {
          return new Date(value['$date'])
        }
        if (parseOptions.dateStringKeys?.includes(key)) {
          return new Date(value)
        }
        if (parseOptions.dateRegexKeys?.test(key)) {
          return new Date(value)
        }
        // YYYY-MM-DDTHH:mm:ss.sssZ | Ddd, JJ Mmm YYYY HH:mm:ss GMT
        if (parseOptions.dateSchema?.includes('JSON&UTC') &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$|^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value)
        ) {
          return new Date(value)
        }
      } else {
        if (parseOptions.dateSchema?.includes('$date') && value['$date']) {
          return value['$date']
        }
      }
    }
    return value
  }
}
