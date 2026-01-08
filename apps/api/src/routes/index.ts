import { OpenAPIHono } from "@hono/zod-openapi";
import userApp from "./user.route.js";
import creatorApp from "./creator.route.js";
import blockApp from "./block.route.js";
import tagApp from "./tag.route.js";
import purchaseApp from "./purchase.route.js";

const appRouter = new OpenAPIHono();

appRouter.route("/users", userApp);
appRouter.route("/creators", creatorApp);
appRouter.route("/blocks", blockApp);
appRouter.route("/tags", tagApp);
appRouter.route("/commerce", purchaseApp);

export default appRouter;
