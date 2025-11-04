// server-https.js
import { createServer } from "https";
import { readFileSync } from "fs";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: readFileSync("./ssl/localhost+3-key.pem"),
  cert: readFileSync("./ssl/localhost+3.pem"),
};


app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => handle(req, res)).listen(3001, "0.0.0.0", () => {
    console.log("🚀 HTTPS Relay running at https://0.0.0.0:3001");
  });
});
