import { JsonOptions } from './JsonOptions';
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
    private parseWithoutComments;
    private reviver;
}
export {};
//# sourceMappingURL=Json.d.ts.map