import { OpenAPIHono } from "@hono/zod-openapi";
import blockApp from "./block.route.js";
import categoryApp from "./category.route.js";
import creatorApp from "./creator.route.js";
import purchaseApp from "./purchase.route.js";
import tagApp from "./tag.route.js";
import userApp from "./user.route.js";

const appRouter = new OpenAPIHono()
  .route("/users", userApp)
  .route("/creators", creatorApp)
  .route("/blocks", blockApp)
  .route("/tags", tagApp)
  .route("/categories", categoryApp)
  .route("/commerce", purchaseApp);

export default appRouter;
