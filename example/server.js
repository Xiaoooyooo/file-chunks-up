import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const __resolve = (filename) => path.resolve(__dirname, filename);

http
  .createServer(async (req, res) => {
    const { method, url } = req;
    res.setHeader("access-control-allow-origin", "*");
    if (method === "OPTIONS") {
      res.statusCode = 204;
      return res.end();
    }
    if (method === "GET" && url === "/") {
      res.writeHead(200, {
        "content-type": "text/html",
      });
      return fs.createReadStream(__resolve("index.html")).pipe(res);
    }

    const jsPath = __resolve(`../dist${/\.js$/.test(url) ? url : `${url}.js`}`);
    if (method === "GET" && fs.existsSync(jsPath)) {
      res.writeHead(200, {
        "content-type": "application/javascript",
      });
      return fs.createReadStream(jsPath).pipe(res);
    }

    if (method === "POST" && url === "/upload") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (Math.random() < 0.2) {
        res.writeHead(500, { "content-type": "application/json" });
        return res.end(
          JSON.stringify({ code: 500, message: "Internal Server Error" }),
        );
      }
      res.writeHead(200, {
        "access-control-allow-origin": "*",
        "content-type": "application/json",
      });
      return res.end(JSON.stringify({ code: 200, data: "OK" }));
    }

    res.statusCode = 404;
    res.end("not found");
  })
  .listen(8888, () => {
    console.log(`server is running at: http://127.0.0.1:8888`);
  });
