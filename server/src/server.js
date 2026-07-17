import http from "http";
import app from "./app.js";
import { initializeSocket } from "./sockets/index.js";

const server = http.createServer(app);

initializeSocket(server);

server.listen(process.env.PORT);