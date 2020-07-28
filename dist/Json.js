"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _options, _removeComments;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Json = void 0;
const cycle = require("cycle");
const jsonDefaultOptions_1 = require("./jsonDefaultOptions");
class Json {
    constructor(options) {
        _options.set(this, void 0);
        _removeComments.set(this, /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g);
        __classPrivateFieldSet(this, _options, {
            stringify: Object.assign({}, jsonDefaultOptions_1.jsonDefaultOptions.stringify),
            parse: Object.assign({}, jsonDefaultOptions_1.jsonDefaultOptions.parse),
        });
        if (options) {
            this.setOptions(options);
        }
    }
    static parse(text, reviver) {
        return this._json.parse(text, reviver);
    }
    static setOptions(options) {
        this._json.setOptions(options);
    }
    static stringify(value, replacer, space) {
        return this._json.stringify(value, replacer, space);
    }
    setOptions(options) {
        Object.assign(__classPrivateFieldGet(this, _options).stringify, options.stringify);
        Object.assign(__classPrivateFieldGet(this, _options).parse, options.parse);
    }
    stringify(value, replacer, space) {
        let data;
        if (__classPrivateFieldGet(this, _options).stringify.decycle) {
            data = JSON.stringify(cycle.decycle(value), this.replacer(replacer), space);
        }
        else {
            data = JSON.stringify(value, this.replacer(replacer), space);
        }
        if (replacer && data === undefined) {
            throw new Error(`A replacer must always return a value :
procedure replace(this, key, value) {
  ...
  return value
}`);
        }
        return data;
    }
    replacer(replace) {
        const that = this;
        /**
         * Eliminate recursion referencing the types
         */
        function replacer(key, value) {
            const options = __classPrivateFieldGet(that, _options).stringify;
            if (value instanceof Set) {
                if (options.setSchema === '$set') {
                    return { $set: [...value] };
                }
                else { // options.setSchema === 'array'
                    return [...value];
                }
            }
            if (value instanceof Map) {
                if (options.mapSchema === '$map') {
                    return { $map: [...value] };
                }
                else { // options.mapSchema === 'array'
                    return [...value];
                }
            }
            if (value instanceof Date) {
                if (options.dateSchema === '$date') {
                    if (options.dateFormat === 'JSON') {
                        return { $date: value.toJSON() };
                    }
                    else { // options.dateFormat === 'UTC'
                        return { $date: value.toUTCString() };
                    }
                }
                else {
                    if (options.dateFormat === 'JSON') {
                        return value.toJSON();
                    }
                    else { // options.dateFormat === 'UTC'
                        return value.toUTCString();
                    }
                }
            }
            return value;
        }
        if (replace) {
            return function replacerHelper(key, value) {
                const data = replace.call(this, key, value);
                if (data !== value) {
                    return data;
                }
                return replacer.call(this, key, value);
            };
        }
        return replacer;
    }
    parse(text, reviver) {
        if (__classPrivateFieldGet(this, _options).parse.removeComments) {
            const textNoComment = text.replace(__classPrivateFieldGet(this, _removeComments), (m, g) => g ? "" : m);
            return this.parseWithoutComments(textNoComment, reviver);
        }
        return this.parseWithoutComments(text, reviver);
    }
    parseWithoutComments(text, reviver) {
        if (__classPrivateFieldGet(this, _options).parse.retrocycle) {
            return cycle.retrocycle(JSON.parse(text, this.reviver(reviver)));
        }
        else {
            return JSON.parse(text, this.reviver(reviver));
        }
    }
    reviver(revive) {
        const that = this;
        function reviver(key, value) {
            var _a, _b, _c, _d, _e, _f;
            if (key && value &&
                typeof value === 'object' &&
                value instanceof Array === false) {
                const options = __classPrivateFieldGet(that, _options).parse;
                if (options.setSchema === '$set' && value['$set'])
                    return new Set(value['$set']);
                if ((_a = options.setStringKeys) === null || _a === void 0 ? void 0 : _a.includes(key))
                    return new Set(value);
                if ((_b = options.setRegexKeys) === null || _b === void 0 ? void 0 : _b.test(key))
                    return new Set(value);
                if (options.mapSchema === '$map' && value['$map'])
                    return new Map(value['$map']);
                if ((_c = options.mapStringKeys) === null || _c === void 0 ? void 0 : _c.includes(key))
                    return new Map(value);
                if ((_d = options.mapRegexKeys) === null || _d === void 0 ? void 0 : _d.test(key))
                    return new Map(value);
                if (options.dateType === 'Date') {
                    if (options.dateSchema.includes('$date') && value['$date']) {
                        return new Date(value['$date']);
                    }
                    if ((_e = options.dateStringKeys) === null || _e === void 0 ? void 0 : _e.includes(key)) {
                        return new Date(value);
                    }
                    if ((_f = options.dateRegexKeys) === null || _f === void 0 ? void 0 : _f.test(key)) {
                        return new Date(value);
                    }
                    // YYYY-MM-DDTHH:mm:ss.sssZ | Ddd, JJ Mmm YYYY HH:mm:ss GMT
                    if (options.dateSchema.includes('JSON&UTC') &&
                        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$|^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value)) {
                        return new Date(value);
                    }
                }
                else {
                    if (options.dateSchema.includes('$date') && value['$date']) {
                        return value['$date'];
                    }
                }
            }
            return value;
        }
        if (revive) {
            return function reviverHelper(key, value) {
                const data = revive.call(this, key, value);
                if (data !== value) {
                    return data;
                }
                return reviver.call(this, key, value);
            };
        }
        return reviver;
    }
}
exports.Json = Json;
_options = new WeakMap(), _removeComments = new WeakMap();
Json._json = new Json();
