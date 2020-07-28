import { StringifyOptions, ParseOptions } from "./JsonOptions"

export interface Options {
  stringify: Required<StringifyOptions>
  parse: Required<ParseOptions>
}
  