import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app.js";

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
console.log(`Server is running on port ${port.toString()}`);

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
serve({
  fetch: app.fetch,
  port: port,
});
