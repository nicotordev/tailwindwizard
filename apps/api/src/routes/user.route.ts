/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { userController } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  ApiKeySchema,
  CreateApiKeySchema,
  NewApiKeyResponseSchema,
  UserPurchaseSchema as PurchaseSchema,
  UpdateUserSchema,
  UserSchema,
  SetupIntentResponseSchema,
  FinishOnboardingSchema,
} from "@tw/shared";

// Routes definition
// GET /me
const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["User"],
  summary: "Get current user profile",
  description: "Retrieves the profile of the currently authenticated user.",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "User profile",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// PATCH /me
const updateMeRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["User"],
  summary: "Update user profile",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "Updated user profile",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// GET /me/purchases
const getMyPurchasesRoute = createRoute({
  method: "get",
  path: "/me/purchases",
  tags: ["User"],
  summary: "Get user purchases",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(PurchaseSchema),
        },
      },
      description: "List of purchases",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// GET /me/api-keys
const getMyApiKeysRoute = createRoute({
  method: "get",
  path: "/me/api-keys",
  tags: ["User"],
  summary: "List API keys",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(ApiKeySchema),
        },
      },
      description: "List of API keys",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// POST /me/api-keys
const createApiKeyRoute = createRoute({
  method: "post",
  path: "/me/api-keys",
  tags: ["User"],
  summary: "Create a new API key",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateApiKeySchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: NewApiKeyResponseSchema,
        },
      },
      description: "API Key created (key shown only once)",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// DELETE /me/api-keys/{id}
const revokeApiKeyRoute = createRoute({
  method: "delete",
  path: "/me/api-keys/{id}",
  tags: ["User"],
  summary: "Revoke an API key",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
      description: "API Key revoked",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// POST /me/create-setup-intent
const createSetupIntentRoute = createRoute({
  method: "post",
  path: "/me/create-setup-intent",
  tags: ["User"],
  summary: "Create a Stripe SetupIntent",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: SetupIntentResponseSchema,
        },
      },
      description: "SetupIntent created",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// POST /me/finish-onboarding
const finishOnboardingRoute = createRoute({
  method: "post",
  path: "/me/finish-onboarding",
  tags: ["User"],
  summary: "Mark onboarding as complete",
  request: {
    body: {
      content: {
        "application/json": {
          schema: FinishOnboardingSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
      description: "Onboarding finished",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// App definition
const userApp = new OpenAPIHono();

userApp.use("*", requireAuth);

const chainedApp = userApp
  .openapi(getMeRoute, (c) => userController.getMe(c))
  .openapi(updateMeRoute, (c) => userController.updateMe(c))
  .openapi(getMyPurchasesRoute, (c) => userController.getMyPurchases(c))
  .openapi(getMyApiKeysRoute, (c) => userController.getMyApiKeys(c))
  .openapi(createApiKeyRoute, (c) => userController.createApiKey(c))
  .openapi(revokeApiKeyRoute, (c) => userController.revokeApiKey(c))
  .openapi(createSetupIntentRoute, (c) => userController.createSetupIntent(c))
  .openapi(finishOnboardingRoute, (c) => userController.finishOnboarding(c));

export default chainedApp;
