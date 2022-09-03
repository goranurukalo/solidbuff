import sb from "./instance";

const s = (v: any) => JSON.stringify(v);
const i2s = (v: any) => JSON.stringify(Array.from(v));
const r2s = (v: any) => `${v.source}-${v.flags}`;

const vr = (v: any) => [v, sb.deserialize(sb.serialize(v))];

describe("browser version of solidbuff", () => {
    // it("should handle 'strings'", () => {
    // 	const [v, r] = vr("Example");
    // 	expect(v).toBe(r);
    // });

    // it("should handle 'Array'", () => {
    // 	const [v, r] = vr([1, null, undefined]);
    // 	expect(s(v)).toBe(s(r));
    // });

    // it("should handle 'Objects in Array'", () => {
    // 	const [v, r] = vr([{ foo: 1 }, { bar: 2 }]);
    // 	expect(s(v)).toBe(s(r));
    // });

    // it("should handle 'Date'", () => {
    // 	const [v, r] = vr(new Date(0));
    // 	expect(s(v)).toBe(s(r));
    // });

    it("should handle 'Object'", () => {
        const [v, r] = vr({ date: new Date(0) });
        expect(s(v)).toBe(s(r));
    });
});
