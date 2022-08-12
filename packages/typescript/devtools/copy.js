import fs from "node:fs";
import path from "node:path";

function assert(expression, message) {
	if (expression) throw new Error(message);
}

const argv = process.argv.slice(2);
const dest = argv.pop();

const destination = path.resolve(dest);
assert(!destination.includes(process.cwd()), "Destination file needs to be inside the project directory");

argv.forEach((s) => {
	const source = path.resolve(s);
	assert(!source.includes(process.cwd()), "Source file needs to be inside the project directory");

	const content = fs.readFileSync(source);
	const contentFileName = path.join(destination, path.basename(source));
	fs.writeFileSync(contentFileName, content);
});
