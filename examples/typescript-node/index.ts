import sb from "solidbuff/node";

/**
 * We have some data that we wish to transfer over wire or to store etc...
 */
const payload = { date: new Date(0) };

/**
 * We can serialize it into Buffer
 * https://nodejs.org/api/buffer.html
 */
const serialized = sb.serialize(payload);
console.log("Serialized", serialized);

/**
 * As well as we can deserialize already serialized data (from another server, client requests, websockets, etc...)
 */
const deserialized = sb.deserialize(serialized);
console.log("Deserialized", deserialized);
