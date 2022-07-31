import { SolidBuffDeserializer, SolidBuffSerializer } from ".";
import type { SOptions } from ".";

/**
 * SolidBuff
 * Serialize and Deserialize prototype for javascript data
 * It should work faster than it is, need to figure out why it isn't
 */
export class SolidBuff {
	protected s: SolidBuffSerializer;
	protected d: SolidBuffDeserializer;
	constructor(options?: SOptions) {
		this.s = new SolidBuffSerializer(options);
		this.d = new SolidBuffDeserializer();
	}

	serialize(v: any): ArrayBuffer {
		return this.s.serialize(v);
	}
	deserialize<T = any>(buffer: ArrayBuffer, offset = 0): T {
		return this.d.deserialize(buffer, offset);
	}
}

export default new SolidBuff();