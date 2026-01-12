import 'server-only';
import axios from "axios";
import type { paths } from "@/types/api";
import { hc } from "hono/client";
import createClient, { type Middleware } from "openapi-fetch";
import type { AppType } from "tw-wizard-api/src/app";
import { auth } from "@clerk/nextjs/server";

/**
 * Configuration for the API client.
 * Using NEXT_PUBLIC_API_URL as the primary base for all requests.
 */
export const API_URL = process.env.BACKEND_URL || "http://localhost:3001";

/**
 * Auth middleware for injecting tokens (e.g. from Clerk or session)
 * This ensures all requests made via apiClient include necessary credentials.
 */
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    try {
      const { getToken } = await auth();
      const token = await getToken();
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (_error) {
      // Not in a request context where auth() is available, or not logged in
    }
    return request;
  },
};

/**
 * apiClient
 * Typed client based on openapi-typescript paths.
 * Provides full type-safety for all /api/v1 routes defined in the OpenAPI schema.
 */
export const apiClient = createClient<paths>({
  baseUrl: API_URL,
});

// Register middleware
apiClient.use(authMiddleware);

/**
 * honoClient
 * Hono RPC Client for end-to-end type safety between frontend and backend.
 */
export const honoClient = hc<AppType>(API_URL);

/**
 * getAuthedHonoClient
 * Returns a Hono client with the current user's token in the Authorization header.
 */
export async function getAuthedHonoClient() {
  const { getToken } = await auth();
  const token = await getToken();
  
  return hc<AppType>(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Standard client export for convenience.
 */
export const client = honoClient;

/**
 * Legacy API support (Axios-based)
 */
export const api = {
  getClient: async () => {
    const { getToken } = await auth();
    const token = await getToken();
    
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_BASE_URL || `${API_URL}/api/v1`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
