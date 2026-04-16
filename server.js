import { startServer } from "./src/server/http-server.js";

const port = Number(process.env.PORT || 4321);

startServer({ port });
