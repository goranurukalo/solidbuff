import { TypeMap } from "../typemap";
import type { TOptions } from "../types";

export class SolidBuffSerializer {
    protected offset: number;
    protected buffer: Buffer;

    constructor({ size = 1048576 /* 1mb */ }: TOptions = {}) {
        this.offset = 0; // TODO: in future we might start from existing buffer
        this.buffer = Buffer.alloc(size);
    }
    public serialize(value: any): Buffer {
        this.cleanup();
        try {
            this.internalSerialization(value);
        } catch (e) {
            // TODO: catch growing error and allocate more memory and try again same part
            console.error(e);

            // TODO: rethrow error that we don't handle -
            // throw e;
        }
        return this.toBuffer();
    }

    protected cleanup() {
        this.offset = 0;
    }

    protected toBuffer() {
        return this.buffer.slice(0, this.offset);
    }

    protected internalSerialization(value: any): void {
        if (value === undefined) {
            this.buffer.writeUint8(TypeMap.undefined, this.offset++);
            return;
        }
        if (value === null) {
            this.buffer.writeUint8(TypeMap.null, this.offset++);
            return;
        }

        const type = typeof value;
        switch (type) {
            case "string": {
                const size = value.length;
                if (size < 0x100) {
                    this.buffer.writeUint8(TypeMap.string8, this.offset++);
                    this.buffer.writeUint8(size, this.offset++);
                } else if (value < 0x10000) {
                    this.buffer.writeUint8(TypeMap.string16, this.offset++);
                    this.buffer.writeUint16BE(size, this.offset);
                    this.offset += 2;
                } else if (value < 0x100000000) {
                    this.buffer.writeUint8(TypeMap.string32, this.offset++);
                    this.buffer.writeUint32BE(size, this.offset);
                    this.offset += 4;
                }

                for (var i = 0; i < size; i++) {
                    this.buffer.writeUint16BE(value.charCodeAt(i), this.offset);
                    this.offset += 2;
                }
                return;
            }
            case "number": {
                if (value === Infinity) {
                    this.buffer.writeUint8(TypeMap.infinity, this.offset++);
                    return;
                }
                if (value === -Infinity) {
                    this.buffer.writeUint8(TypeMap.negativeInfinity, this.offset++);
                    return;
                }
                if (Number.isNaN(value)) {
                    this.buffer.writeUint8(TypeMap.NaN, this.offset++);
                    return;
                }

                if (!Number.isInteger(value)) {
                    this.buffer.writeUint8(TypeMap.float64, this.offset++);
                    this.buffer.writeDoubleBE(value, this.offset);
                    this.offset += 8;
                    return;
                }

                if (value < 0x100) {
                    if (value >= -0x80) {
                        this.buffer.writeUint8(TypeMap.int8, this.offset++);
                        this.buffer.writeInt8(value, this.offset++);
                    } else if (value >= -0x8000) {
                        this.buffer.writeUint8(TypeMap.int16, this.offset++);
                        this.buffer.writeInt16BE(value, this.offset);
                        this.offset += 2;
                    } else if (value >= -0x80000000) {
                        this.buffer.writeUint8(TypeMap.int32, this.offset++);
                        this.buffer.writeInt32BE(value, this.offset);
                        this.offset += 4;
                    } else {
                        this.buffer.writeUint8(TypeMap.float64, this.offset++);
                        this.buffer.writeDoubleBE(value, this.offset);
                        this.offset += 8;
                    }
                    return;
                }

                if (value < 0x100) {
                    this.buffer.writeUint8(TypeMap.uint8, this.offset++);
                    this.buffer.writeUint8(value, this.offset++);
                } else if (value < 0x10000) {
                    this.buffer.writeUint8(TypeMap.uint16, this.offset++);
                    this.buffer.writeUint16BE(value, this.offset);
                    this.offset += 2;
                } else if (value < 0x100000000) {
                    this.buffer.writeUint8(TypeMap.uint32, this.offset++);
                    this.buffer.writeUint32BE(value, this.offset);
                    this.offset += 4;
                } else {
                    this.buffer.writeUint8(TypeMap.float64, this.offset++);
                    this.buffer.writeDoubleBE(value, this.offset);
                    this.offset += 8;
                }
                return;
            }
            case "bigint": {
                this.buffer.writeUint8(TypeMap.bigint, this.offset++);
                this.buffer.writeBigInt64BE(value, this.offset);
                this.offset += 8;
                return;
            }
            case "boolean": {
                this.buffer.writeUint8(value ? TypeMap.true : TypeMap.false, this.offset++);
                return;
            }
            case "object": {
                const { constructor } = Object.getPrototypeOf(value);
                switch (constructor) {
                    case Object: {
                        this.buffer.writeUint8(TypeMap.objectStart, this.offset++);
                        for (const key in value) {
                            this.internalSerialization(key);
                            this.internalSerialization(value[key]);
                        }
                        this.buffer.writeUint8(TypeMap.objectEnd, this.offset++);
                        return;
                    }
                    case Array: {
                        const size = value.length;
                        if (size < 0x100) {
                            this.buffer.writeUint8(TypeMap.array8, this.offset++);
                            this.buffer.writeUint8(size, this.offset++);
                        } else if (size < 0x10000) {
                            this.buffer.writeUint8(TypeMap.array16, this.offset++);
                            this.buffer.writeUint16BE(size, this.offset++);
                            this.offset += 2;
                        } else if (size < 0x100000000) {
                            this.buffer.writeUint8(TypeMap.array32, this.offset++);
                            this.buffer.writeUint32BE(size, this.offset);
                            this.offset += 4;
                        } else {
                            // this is really big array
                            throw new Error("Not implemented");
                        }

                        for (const v of value) {
                            this.internalSerialization(v);
                        }
                        return;
                    }
                    case Date: {
                        this.buffer.writeUint8(TypeMap.date, this.offset++);
                        this.buffer.writeDoubleBE(value.getTime(), this.offset);
                        this.offset += 8;
                        return;
                    }
                    case RegExp: {
                        this.buffer.writeUint8(TypeMap.regex, this.offset++);
                        this.internalSerialization(value.source);
                        this.internalSerialization(value.flags);
                        return;
                    }
                    case Set: {
                        this.buffer.writeUint8(TypeMap.setStart, this.offset++);
                        for (const v of value) {
                            this.internalSerialization(v);
                        }
                        this.buffer.writeUint8(TypeMap.setEnd, this.offset++);
                        return;
                    }
                    case Map: {
                        this.buffer.writeUint8(TypeMap.mapStart, this.offset++);
                        for (const [k, v] of value) {
                            this.internalSerialization(k);
                            this.internalSerialization(v);
                        }
                        this.buffer.writeUint8(TypeMap.mapEnd, this.offset++);
                        return;
                    }
                    // TODO: rest
                }
                return;
            }
        }
    }
}

export class SolidBuffDeserializer {
    protected offset!: number;
    protected buffer!: Buffer;

    public deserialize<T = any>(buffer: Buffer, offset = 0): T {
        this.offset = offset;
        this.buffer = buffer;
        return this.internalDeserialization();
    }

    protected internalDeserialization(): any {
        const type = this.buffer.readUint8(this.offset++);
        switch (type) {
            case TypeMap.undefined:
                return undefined;
            case TypeMap.null:
                return null;
            case TypeMap.true:
                return true;
            case TypeMap.false:
                return false;
            case TypeMap.infinity:
                return Infinity;
            case TypeMap.negativeInfinity:
                return -Infinity;
            case TypeMap.NaN:
                return NaN;

            case TypeMap.uint8:
                return this.buffer.readUint8(this.offset++);
            case TypeMap.uint16: {
                const v = this.buffer.readUint16BE(this.offset);
                this.offset += 2;
                return v;
            }
            case TypeMap.uint32: {
                const v = this.buffer.readUint32BE(this.offset);
                this.offset += 4;
                return v;
            }
            case TypeMap.bigint: {
                const v = this.buffer.readBigInt64BE(this.offset);
                this.offset += 8;
                return v;
            }
            case TypeMap.int8:
                return this.buffer.readInt8(this.offset++);
            case TypeMap.int16: {
                const v = this.buffer.readInt16BE(this.offset);
                this.offset += 2;
                return v;
            }
            case TypeMap.int32: {
                const v = this.buffer.readInt32BE(this.offset);
                this.offset += 4;
                return v;
            }

            case TypeMap.float64: {
                const v = this.buffer.readDoubleBE(this.offset);
                this.offset += 8;
                return v;
            }

            case TypeMap.array8: {
                const size = this.buffer.readUint8(this.offset++);
                return this.readArray(size);
            }
            case TypeMap.array16: {
                const size = this.buffer.readUint16BE(this.offset);
                this.offset += 2;
                return this.readArray(size);
            }
            case TypeMap.array32: {
                const size = this.buffer.readUint32BE(this.offset);
                this.offset += 4;
                return this.readArray(size);
            }

            case TypeMap.string8: {
                const size = this.buffer.readUint8(this.offset++);
                return this.readString(size * 2);
            }
            case TypeMap.string16: {
                const size = this.buffer.readUint16BE(this.offset);
                this.offset += 2;
                return this.readString(size * 2);
            }
            case TypeMap.string32: {
                const size = this.buffer.readUint32BE(this.offset);
                this.offset += 4;
                return this.readString(size * 2);
            }

            case TypeMap.date: {
                const v = new Date(this.buffer.readDoubleBE(this.offset));
                this.offset += 8;
                return v;
            }
            case TypeMap.regex: {
                const source = this.internalDeserialization();
                const flags = this.internalDeserialization();
                return new RegExp(source, flags);
            }

            case TypeMap.setStart: {
                const set = new Set();
                let current = this.buffer.readUint8(this.offset);
                while (current !== TypeMap.setEnd) {
                    const value = this.internalDeserialization();
                    set.add(value);
                    current = this.buffer.readUint8(this.offset);
                }
                this.offset++;
                return set;
            }
            case TypeMap.mapStart: {
                const map = new Map();
                let current = this.buffer.readUint8(this.offset);
                while (current !== TypeMap.mapEnd) {
                    const key = this.internalDeserialization();
                    const value = this.internalDeserialization();
                    map.set(key, value);
                    current = this.buffer.readUint8(this.offset);
                }
                this.offset++;
                return map;
            }
            case TypeMap.objectStart: {
                const object: any = {};
                let current = this.buffer.readUint8(this.offset);

                while (current !== TypeMap.objectEnd) {
                    const key = this.internalDeserialization();
                    object[key] = this.internalDeserialization();
                    current = this.buffer.readUint8(this.offset);
                }
                this.offset++;
                return object;
            }
        }
    }

    protected readArray(size: number) {
        const array = new Array(size);
        for (let i = 0; i < size; i++) {
            array[i] = this.internalDeserialization();
        }
        return array;
    }
    protected readString(size: number) {
        let str = "";
        let length = this.offset + size;
        while (this.offset < length) {
            str += String.fromCharCode(this.buffer.readUint16BE(this.offset));
            this.offset += 2;
        }
        return str;
    }
}
