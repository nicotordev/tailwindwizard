import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import * as CartController from "../controllers/cart.controller.js";
import { CartSchema, AddToCartSchema, CartItemSchema } from "@tw/shared";
import { requireAuth } from "../middleware/requireAuth.js";

const cartApp = new OpenAPIHono();

// Auth protection for all cart routes
cartApp.use("*", requireAuth);

const tags = ["Cart"];

// GET /cart
const getCartRoute = createRoute({
  method: "get",
  path: "/",
  tags,
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CartSchema,
        },
      },
      description: "Retrieve the user's cart",
    },
  },
});

// POST /cart/items
const addToCartRoute = createRoute({
  method: "post",
  path: "/items",
  tags,
  request: {
    body: {
      content: {
        "application/json": {
          schema: AddToCartSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CartItemSchema,
        },
      },
      description: "Item added to cart",
    },
    409: {
      description: "Item already in cart",
    },
  },
});

// DELETE /cart/items/{id}
const removeFromCartRoute = createRoute({
  method: "delete",
  path: "/items/{id}",
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Item removed from cart",
    },
    404: {
      description: "Item not found",
    },
  },
});

// DELETE /cart
const clearCartRoute = createRoute({
  method: "delete",
  path: "/",
  tags,
  responses: {
    204: {
      description: "Cart cleared",
    },
  },
});

const chainedApp = cartApp
  .openapi(getCartRoute, (c) => CartController.getCart(c))
  .openapi(addToCartRoute, (c) => CartController.addToCart(c))
  .openapi(removeFromCartRoute, (c) => CartController.removeFromCart(c))
  .openapi(clearCartRoute, (c) => CartController.clearCart(c));

export default chainedApp;
