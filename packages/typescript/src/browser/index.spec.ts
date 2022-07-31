import sb from "./instance";

/**
 * Currently i don't wanna add deps like vitest or jest
 * TODO: add proper testing support
 */

// const s = (v: any) => JSON.stringify(v);
// const i2s = (v: any) => JSON.stringify(Array.from(v));
// const r2s = (v: any) => `${v.source}-${v.flags}`;

// const v1 = "Example";
// const v2 = 10;
// const v3 = new Date();
// const v4 = null;
// const v5 = [1, null, undefined];
// const v6 = { foo: null, bar: "test", baz: 1 };
// const v7 = 1n;
// const v8 = "";
// const v9 = new Map([
//   ["1", 1],
//   ["2", 2]
// ]);
// const v10 = new Set(["1", "2", "3", "3"]);
// const v11 = /123/g;
// const v12 = "i ♥ SolidBuff";

// const b1 = sb.serialize(v1);
// const b2 = sb.serialize(v2);
// const b3 = sb.serialize(v3);
// const b4 = sb.serialize(v4);
// const b5 = sb.serialize(v5);
// const b6 = sb.serialize(v6);
// const b7 = sb.serialize(v7);
// const b8 = sb.serialize(v8);
// const b9 = sb.serialize(v9);
// const b10 = sb.serialize(v10);
// const b11 = sb.serialize(v11);
// const b12 = sb.serialize(v12);

// const r1 = sb.deserialize(b1);
// const r2 = sb.deserialize(b2);
// const r3 = sb.deserialize(b3);
// const r4 = sb.deserialize(b4);
// const r5 = sb.deserialize(b5);
// const r6 = sb.deserialize(b6);
// const r7 = sb.deserialize(b7);
// const r8 = sb.deserialize(b8);
// const r9 = sb.deserialize(b9);
// const r10 = sb.deserialize(b10);
// const r11 = sb.deserialize(b11);
// const r12 = sb.deserialize(b12);

// console.log(r1 === v1);
// console.log(r2 === v2);
// console.log(r3.toISOString() === v3.toISOString());
// console.log(r4 === v4);
// console.log(s(r5) === s(v5));
// console.log(s(r6) === s(v6));
// console.log(r7 === v7);
// console.log(r8 === v8);
// console.log(i2s(r9.values()) === i2s(v9.values()));
// console.log(i2s(r10.values()) === i2s(v10.values()));
// console.log(r2s(r11) === r2s(v11));
// console.log(r12 === v12);
