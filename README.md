<h1 align="center">SolidBuff💪</h1>
<h4 align="center"><i>serialization/deserialization library for JavaScript and TypeScript on Browser or Server (not yet) with built in compression.</i></h4>

<br />

> Its intended to be educational resource (with a goal to become more than that)

## Getting started
Install the library with your package manager of choice, e.g.:

```sh
yarn add <TODO solidbuff>
```

## Basic Usage
The easiest way to use SolidBuff is with its built in instance (`<TODO>/instance`) and `serialize`, `deserialize` methods.

Easily serialize all of your data:

```ts
import sb from 'solidbuff/node'; // or
// import sb from 'solidbuff/browser';

const object = { date: new Date(0)};
const payload = sb.serialize(object);
// payload => Uint8Array([84,40,4,0,100,0,97,0,116,0,101,60,0,0,0,0,0,0,0,0,85]) // 21B
```

And deserialize it:
```ts
const object = sb.deserialize<{ date: Date }>(payload);
// object => { date: new Date(0) }
```

<br />
<br />

> (TS) Make sure to have `"moduleResolution": "NodeNext"` setup in tsconfig for it to work correctly
```json
{
	"compilerOptions": {
		"moduleResolution": "NodeNext"
	}
}
```
<br />

## Why

For quite some time now i was thinking about how it would be really nice to have faster and more performant way to send data between two sources. <br />
I already had contact with similar things (protobuf's, msgpack, etc...) and got idea to build my own in TypeScript, for fun ofc.

## Goals

It should be:

1. Simple codebase
1. Lightweight clients
1. Extensible serialization/deserialization
1. Performance (needs more work/testing 😅)
1. Small data transferred over the wire
1. Schema-less
1. Language agnostic (It should be possible, but JavaScript is first citizen, unless)

## How its done

Its done by using Buffers in Nodejs, in browsers they are more known as [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

Its an array of bytes, to manipulate with them we need to use [view objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

<br/>

To have schema-less but still strongly typed protocol, idea began from msgpack with mix of protobuf.

Its block based serialization. Each block is prefixed with single byte that defines whole block. some special types (e.g. objects) needs to have start and end "signals".

<i>This document was inspired by the [Sia spec](https://github.com/pouya-eghbali/sia/blob/master/specs.md) file.</i>

## Roadmap

1. Resizable buffer
1. Add ability to add non-default data types
1. Make it as fast as possible
1. ~~Make server version~~
1. Make package to distribute easier (probably make separate packages)
1. Add more examples (currently in `index.spec.ts` files)
1. ~~Use esbuild for bundling~~ (*used different tool*)
1. ~~Use enums instead of raw numbers for types~~
1. Add eslint, prettier and similar tools
1. Add docs
1. Place at the end for inspiration and all the credits
1. Add Rust and Go version (both server and client are same)

<br />
<br />
Thanks for checking