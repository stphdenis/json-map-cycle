import { Options } from "./Options"

export const jsonDefaultOptions: Options = {
  stringify: {
    dateSchema: false,
    dateFormat: 'JSON',

    setSchema: '$set',

    mapSchema: '$map',

    decycle: false,
  },
  parse: {
    dateSchema: ['$date', 'JSON&UTC'],
    dateStringKeys: null,
    dateRegexKeys: null,
    dateType: "Date",
    
    setSchema: '$set',
    setStringKeys: null,
    setRegexKeys: null,
    
    mapSchema: '$map',
    mapStringKeys: null,
    mapRegexKeys: null,

    removeComments: true,
    retrocycle: true,
  },
}
