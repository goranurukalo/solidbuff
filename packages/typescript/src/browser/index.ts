// Credits
// https://github.com/pouya-eghbali/sia (heavy inspiration, reshaped and confirmed idea)
// https://github.com/blitz-js/superjson
// https://javascript.info/arraybuffer-binary-arrays
// https://github.com/protobufjs/protobuf.js/blob/master/src/index-minimal.js
// https://github.com/Rich-Harris/devalue#xss-mitigation
// and many many others

// TODO: another thing we can test so we don't need to do buffer allocation would be to have linked list of buffers and at end we make one (sum size while going, decoding strings could be harder maybe?)
// TODO: string testing - check difference if we have uint8 that we skip [type, skip, size, string...] + subarrays
// TODO: Support both platforms - "browser": "index-browser.js", "main": "index-node.js",
// TODO: use enum for map + esbuild to build files and it will omit enum and just replace values where needed

/**
 * Type map
 *
 *  10 "undefined",
 *  11 "null",
 *  12 "true",
 *  13 "false",
 *  14 "Infinity"
 *  15 "-Infinity"
 *  16 "NaN"
 *
 *  20 "uint8",
 *  21 "uint16",
 *  22 "uint32",
 *  23 "uint64", // BigInt
 *  24 "int8",
 *  25 "int16",
 *  26 "int32",
 *  27 "float32",
 *  28 "float64",
 *
 *  30 "array8"
 *  31 "array16"
 *  32 "array32"
 *
 *  40 "string8",
 *  41 "string16",
 *  42 "string32",
 *  "string64",
 *  "string128",
 *  "stringN",
 *
 *  50 "bin8",
 *  51 "bin16",
 *  52 "bin32",
 *
 *  60 "date",
 *  65 "regex",
 *  66 "Symbol????",
 *
 *  70 "ref"?
 *
 *  80 "setStart",
 *  81 "setEnd",
 *  82 "mapStart",
 *  83 "mapEnd",
 *  84 "objectStart",
 *  85 "objectEnd",
 *
 */

/**
 * We have more space for expanding
 * First few spots (0-9) are free just in case of something important
 * Rest after 100 can be used for specific implementations or just for language/application specific Objects
 * In case we can't do that, we can use something like plugins where we can add our app specific implementations with basic interface
 */

export type SOptions = { size?: number };
export class SolidBuffSerializer {
	protected offset: number;
	protected buffer: ArrayBuffer;
	protected view: DataView;

	constructor({ size = 1048576 /* 1mb */ }: SOptions = {}) {
		this.offset = 0; // TODO: in future we might start from existing buffer
		this.buffer = new ArrayBuffer(size);
		this.view = new DataView(this.buffer);
	}

	// TODO: maybe value should have proper type
	public serialize(value: any): ArrayBuffer {
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
		if (value === undefined) return this.view.setUint8(this.offset++, 10);
		if (value === null) return this.view.setUint8(this.offset++, 11);

		const type = typeof value;
		switch (type) {
			case "string":
				// TODO, if sting, we can grow buffer right away in case its too small ?
				// https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
				// https://developer.chrome.com/blog/how-to-convert-arraybuffer-to-and-from-string/

				const size = value.length;
				if (size < 0x100) {
					this.view.setUint8(this.offset++, 40);
					this.view.setUint8(this.offset++, size);
				} else if (value < 0x10000) {
					this.view.setUint8(this.offset++, 41);
					this.view.setUint16(this.offset, size);
					this.offset += 2;
				} else if (value < 0x100000000) {
					this.view.setUint8(this.offset++, 42);
					this.view.setUint32(this.offset, size);
					this.offset += 4;
				}

				for (var i = 0; i < size; i++) {
					this.view.setUint16(this.offset, value.charCodeAt(i));
					this.offset += 2;
				}
				return;

			case "number": {
				if (value === Infinity) {
					this.view.setUint8(this.offset++, 14);
					return;
				}
				if (value === -Infinity) {
					this.view.setUint8(this.offset++, 15);
					return;
				}
				if (Number.isNaN(value)) {
					this.view.setUint8(this.offset++, 16);
					return;
				}

				// negative values
				if (value < 0) {
					if (value >= -0x80) {
						this.view.setUint8(this.offset++, 24);
						this.view.setInt8(this.offset++, value);
					} else if (value >= -0x8000) {
						this.view.setUint8(this.offset++, 25);
						this.view.setInt16(this.offset, value);
						this.offset += 2;
					} else if (value >= -0x80000000) {
						this.view.setUint8(this.offset++, 26);
						this.view.setInt32(this.offset, value);
						this.offset += 4;
					} else {
						this.view.setUint8(this.offset++, 28);
						this.view.setFloat64(this.offset, value);
						this.offset += 8;
					}
					return;
				}

				// positive values
				if (value < 0x100) {
					this.view.setUint8(this.offset++, 20);
					this.view.setUint8(this.offset++, value);
				} else if (value < 0x10000) {
					this.view.setUint8(this.offset++, 21);
					this.view.setUint16(this.offset, value);
					this.offset += 2;
				} else if (value < 0x100000000) {
					this.view.setUint8(this.offset++, 22);
					this.view.setUint32(this.offset, value);
					this.offset += 4;
				} else {
					this.view.setUint8(this.offset++, 28);
					this.view.setFloat64(this.offset, value);
					this.offset += 8;
				}
				return;
			}
			case "bigint": {
				this.view.setUint8(this.offset++, 23);
				this.view.setBigUint64(this.offset, value);
				this.offset += 8;
				return;
			}
			case "boolean":
				return this.view.setUint8(this.offset++, value ? 12 : 13);
			case "object": {
				const { constructor } = Object.getPrototypeOf(value);
				switch (constructor) {
					case Object:
						this.view.setUint8(this.offset++, 84);
						for (const key in value) {
							this.internalSerialization(key);
							this.internalSerialization(value[key]);
						}
						this.view.setUint8(this.offset++, 85);
						return;
					case Array: {
						const size = value.length;
						if (size < 0x100) {
							this.view.setUint8(this.offset++, 30);
							this.view.setUint8(this.offset++, size);
						} else if (size < 0x10000) {
							this.view.setUint8(this.offset++, 31);
							this.view.setUint16(this.offset, size);
							this.offset += 2;
						} else if (size < 0x100000000) {
							this.view.setUint8(this.offset++, 32);
							this.view.setUint32(this.offset, size);
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
					case Date:
						this.view.setUint8(this.offset++, 60);
						this.view.setFloat64(this.offset, value.getTime());
						this.offset += 8;
						return;
					case RegExp:
						this.view.setUint8(this.offset++, 65);
						this.internalSerialization(value.source);
						this.internalSerialization(value.flags);
						return;
					case Set:
						this.view.setUint8(this.offset++, 80);
						for (const v of value) {
							this.internalSerialization(v);
						}
						this.view.setUint8(this.offset++, 81);
						return;
					case Map:
						this.view.setUint8(this.offset++, 82);
						for (const [k, v] of value) {
							this.internalSerialization(k);
							this.internalSerialization(v);
						}
						this.view.setUint8(this.offset++, 83);
						return;

					// TODO: support refs
					// Buffer
					// if we wanna support "plugin's", use weakmap
				}

				return;
			}
		}
	}
}

// type DOptions = {};
export class SolidBuffDeserializer {
	protected offset!: number;
	protected buffer!: ArrayBuffer;
	protected view!: DataView;

	// constructor(options?: Doptions) {}

	public deserialize<T = any>(buffer: ArrayBuffer, offset = 0): T {
		this.offset = offset;
		this.buffer = buffer;
		this.view = new DataView(buffer);
		return this.internalDeserialization();
	}

	protected internalDeserialization(): any {
		const type = this.view.getUint8(this.offset++);
		switch (type) {
			case 10:
				return undefined;
			case 11:
				return null;
			case 12:
				return true;
			case 13:
				return false;
			case 14:
				return Infinity;
			case 15:
				return -Infinity;
			case 16:
				return NaN;

			case 20:
				return this.view.getUint8(this.offset++);
			case 21: {
				const v = this.view.getUint16(this.offset);
				this.offset += 2;
				return v;
			}
			case 22: {
				const v = this.view.getUint32(this.offset);
				this.offset += 4;
				return v;
			}
			case 23: {
				const v = this.view.getBigUint64(this.offset);
				this.offset += 8;
				return v;
			}
			case 24:
				return this.view.getInt8(this.offset++);
			case 25: {
				const v = this.view.getInt16(this.offset);
				this.offset += 2;
				return v;
			}
			case 26: {
				const v = this.view.getInt32(this.offset);
				this.offset += 4;
				return v;
			}
			// case 27: return null;
			case 28: {
				const v = this.view.getFloat64(this.offset);
				this.offset += 8;
				return v;
			}

			case 30: {
				const size = this.view.getUint8(this.offset++);
				return this.readArray(size);
			}
			case 31: {
				const size = this.view.getUint8(this.offset);
				this.offset += 2;
				return this.readArray(size);
			}
			case 32: {
				const size = this.view.getUint8(this.offset);
				this.offset += 4;
				return this.readArray(size);
			}

			case 40: {
				const size = this.view.getUint8(this.offset++);
				return this.readString(size * 2);
			}
			case 41: {
				const size = this.view.getUint16(this.offset);
				this.offset += 2;
				return this.readString(size * 2);
			}
			case 42: {
				const size = this.view.getUint32(this.offset);
				this.offset += 4;
				return this.readString(size * 2);
			}

			// case 50: return null; // Bin TODO:
			// case 51: return null;
			// case 52: return null;

			case 60: {
				const v = new Date(this.view.getFloat64(this.offset));
				this.offset += 8;
				return v;
			}
			case 65: {
				const source = this.internalDeserialization();
				const flags = this.internalDeserialization();
				return new RegExp(source, flags);
			}

			// case 70: return null; // Ref? TODO:

			case 80: {
				const set = new Set();
				let current = this.view.getUint8(this.offset);
				while (current !== 81) {
					const value = this.internalDeserialization();
					set.add(value);
					current = this.view.getUint8(this.offset);
				}
				return set;
			}
			case 82: {
				const map = new Map();
				let current = this.view.getUint8(this.offset);
				while (current !== 83) {
					const key = this.internalDeserialization();
					const value = this.internalDeserialization();
					map.set(key, value);
					current = this.view.getUint8(this.offset);
				}
				return map;
			}
			case 84: {
				const object: any = {};
				let current = this.view.getUint8(this.offset);

				while (current !== 85) {
					const key = this.internalDeserialization();
					object[key] = this.internalDeserialization();
					current = this.view.getUint8(this.offset);
				}
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
		// TODO: maybe something like this + slicing buffer could work faster? (need testing)
		// const f = new Uint8Array(this.buffer);
		// const strView = new Uint16Array(f.subarray(this.offset, size * 2));
		// return String.fromCharCode.apply(
		//   null,
		//   // @ts-ignore
		//   strView.subarray(this.offset, size)
		// );
		//
		// read more protobuf and others on implementations
		let str = "";
		let length = this.offset + size;
		while (this.offset < length) {
			str += String.fromCharCode(this.view.getUint16(this.offset));
			this.offset += 2;
		}
		return str;
	}
}
