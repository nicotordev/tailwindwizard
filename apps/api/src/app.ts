import { clerkMiddleware } from "@hono/clerk-auth";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { pinoLogger } from "hono-pino";
// Routes
import appRouter from "./routes/index.js";

const app = new OpenAPIHono<{ Bindings: NodeJS.ProcessEnv }>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          errors: result.error.issues,
        },
        400
      );
    }
  },
});

// Logger
app.use(
  "*",
  pinoLogger({
    pino: {
      level: "info",
    },
  })
);

// Security & CORS
app.use("*", secureHeaders());
app.use("/api/*", cors());

// Clerk Auth
app.use("*", clerkMiddleware());

app.route("/api/v1", appRouter);

// Swagger UI
app.get("/ui", swaggerUI({ url: "/doc" }));

// OpenAPI Doc
app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "TailwindWizard API",
    version: "1.0.0",
    description: "API for TailwindWizard onboarding and resume parsing",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
});

export type AppType = typeof app;
export default app;
