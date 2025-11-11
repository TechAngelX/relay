// server-https.js
import { createServer } from "https";
import { readFileSync } from "fs";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// ✅ Use ssl certs
const httpsOptions = {
  key: readFileSync("./ssl/localhost+3-key.pem"),
  cert: readFileSync("./ssl/localhost+3.pem"),
};

app.prepare().then(() => {
  const frontendServer = createServer(httpsOptions, (req, res) => handle(req, res));

  frontendServer.listen(3001, "0.0.0.0", () => {
    console.log("🖥️ Frontend HTTPS running at https://192.168.0.10:3001");
  });

});

