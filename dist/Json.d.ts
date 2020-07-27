interface ParseOptions {
    /**
     * Parse `{ "anyKey": { "$set": [...] } }`
     *
     * default: '$set'
     */
    setSchema?: '$set' | false;
    /**
     * Keys to consider a value as a Set.
     *
     * A key can't begin by '$'
     */
    setStringKeys?: string[] | null;
    /**
     * Keys to consider a value as a Set.
     *
     * Ex: /^\w*Set|\w*-set$/ => 'xxxSet' et 'xxx-set'
     *
     * A key can't begin by '$'
     */
    setRegexKeys?: RegExp | null;
    /**
     * Parse `{ "anyKey": { "$map": [...] } }`
     *
     * default: '$map'
     */
    mapSchema?: '$map' | false;
    /**
     * Keys to consider a value as a Map.
     *
     * A key can't begin by '$'
     */
    mapStringKeys?: string[] | null;
    /**
     * Keys to consider a value as a Map.
     *
     * Ex: /^\w*Map|\w*-map$/ => 'xxxMap' et 'xxx-map'
     *
     * A key can't begin by '$'
     */
    mapRegexKeys?: RegExp | null;
    /**
     * '$Date' => { "anyKey": { "$date": "..." } }
     *
     * 'JSON&UTC' => { "anyKey": "2020-07-27T09:49:00.947Z" }
     *
     * 'JSON&UTC' => { "anyKey": "Mon, 27 Jul 2020 09:50:51 GMT" }
     *
     * default: ['$date', 'JSON&UTC']
     */
    dateSchema?: ('$date' | 'JSON&UTC')[];
    /**
     * Keys to consider a value as a Date.
     *
     * A key can't begin by '$'
     */
    dateStringKeys?: string[] | null;
    /**
     * Keys to consider a value as a Date.
     *
     * Ex: /^\w*Date|\w*-date$/ => '*Date' et '*-date'
     *
     * A key can't begin by '$'
     */
    dateRegexKeys?: RegExp | null;
    /**
     * If dateType = "Date" then
     *
     * Parse to `{ "anyKey": new Date("...") }`
     *
     * If dateType = "String" then
     *
     * Parse to `{ "anyKey": "..." }`
     */
    dateType?: "String" | "Date";
    retrocycle: boolean;
}
interface StringifyOptions {
    setSchema?: '$set' | 'array';
    mapSchema?: '$map' | 'array';
    dateSchema?: '$date' | false;
    dateFormat?: 'JSON' | 'UTC';
    decycle: boolean;
}
export interface JsonOptions {
    parse?: ParseOptions;
    stringify?: StringifyOptions;
}
declare type Reviver = (this: any, key: string, value: any) => any;
declare type Replacer = (this: any, key: string, value: any) => any;
export declare class Json {
    #private;
    private static _json;
    static parse(text: string, reviver?: Reviver): any;
    static setOptions(options: JsonOptions): void;
    static stringify(value: any, replacer?: Replacer | null, space?: string | number): string;
    constructor(options?: JsonOptions);
    setOptions(options: JsonOptions): void;
    stringify(value: any, replacer?: Replacer | null, space?: string | number): string;
    private replacer;
    parse(text: string, reviver?: Reviver): any;
    private reviver;
}
export {};
//# sourceMappingURL=Json.d.ts.map