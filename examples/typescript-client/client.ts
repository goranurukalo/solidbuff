import sb from "solidbuff/browser";

/**
 * We have some data that we wish to transfer over wire or to store etc...
 */
const payload = { date: new Date(0) };

/**
 * We can serialize it into ArrayBuffer
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
 */
const serialized = sb.serialize(payload);
console.log("Serialized", serialized);

/**
 * As well as we can deserialize already serialized data (from server, websockets, webworkers, etc...)
 */
const deserialized = sb.deserialize(serialized);
console.log("Deserialized", deserialized);
