import createClient from "openapi-fetch";
import type { paths } from "@/types/api";

/**
 * Mirror API URL.
 * By default, we use relative paths to hit the Next.js mirror API endpoints
 * which then proxy requests to the real backend with proper authentication.
 */
export const API_URL = "";

/**
 * Frontend API client (Client-side).
 * Calls the Next.js Mirror API endpoints in apps/frontend/app/api/v1.
 */
export const apiClient = createClient<paths>({
  baseUrl: API_URL,
});