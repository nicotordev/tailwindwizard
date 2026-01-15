import { OpenAPIHono } from "@hono/zod-openapi";
import blockApp from "./block.route.js";
import categoryApp from "./category.route.js";
import creatorApp from "./creator.route.js";
import purchaseApp from "./purchase.route.js";
import tagApp from "./tag.route.js";
import userApp from "./user.route.js";
import adminApp from "./admin.route.js";
import cartApp from "./cart.route.js";
import collectionApp from "./collection.route.js";
import resumeApp from "./resume.route.js";
import { stripeWebhookRoute } from "../services/stripe.webhook.js";

const appRouter = new OpenAPIHono()
  .route("/users", userApp)
  .route("/creators", creatorApp)
  .route("/admin", adminApp)
  .route("/blocks", blockApp)
  .route("/cart", cartApp)
  .route("/collections", collectionApp)
  .route("/resume", resumeApp)
  .route("/tags", tagApp)
  .route("/categories", categoryApp)
  .route("/commerce", purchaseApp)
  .route("/", stripeWebhookRoute);

export default appRouter;
