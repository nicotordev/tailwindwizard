import 'server-only';
import axios from "axios";
import type { paths } from "@/types/api";
import { hc } from "hono/client";
import createClient, { type Middleware } from "openapi-fetch";
import type { AppType } from "tw-wizard-api/src/app";

/**
 * Configuration for the API client.
 * Using NEXT_PUBLIC_API_URL as the primary base for all requests.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Auth middleware for injecting tokens (e.g. from Clerk or session)
 * This ensures all requests made via apiClient include necessary credentials.
 */
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    return request;
  },
};

/**
 * apiClient
 * Typed client based on openapi-typescript paths.
 * Provides full type-safety for all /api/v1 routes defined in the OpenAPI schema.
 *
 * @example
 * const { data, error } = await apiClient.GET("/api/v1/users/me");
 */
export const apiClient = createClient<paths>({
  baseUrl: API_URL,
});

// Register middleware
apiClient.use(authMiddleware);

/**
 * honoClient
 * Hono RPC Client for end-to-end type safety between frontend and backend.
 * Connects directly to the Hono instance for a fluent, chained API experience.
 *
 * @example
 * const res = await client.api.v1.users.me.$get();
 */
export const honoClient = hc<AppType>(API_URL);

/**
 * Standard client export for convenience.
 */
export const client = honoClient;

/**
 * Legacy API support (Axios-based)
 * Uses NEXT_PUBLIC_BASE_URL for the base path.
 */
export const api = {
  getClient: () => {
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_BASE_URL || `${API_URL}/api/v1`,
    });
  },
};
