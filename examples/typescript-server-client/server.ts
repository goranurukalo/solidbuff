import http from "node:http";
import sb from "solidbuff/node";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000,
};

http.createServer(function (req, res) {
    res.writeHead(200, headers);
    const payload = sb.serialize({ date: new Date(0) });
    console.log("payload", payload);
    res.write(payload, "binary");
    res.end();
}).listen(8000);
