"use client";

import axios, { AxiosResponse } from "axios";
import type { components } from "@/types/api";

type Schema = components["schemas"];

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

/**
 * Generic helper to reduce boilerplate for standard resource endpoints
 */
const createResource = <T extends keyof Schema>(path: string) => ({
  list: (): Promise<AxiosResponse<Schema[T][]>> =>
    axiosClient.get(`/api/v1/${path}`),
  identifier: (identifier: string): Promise<AxiosResponse<Schema[T]>> =>
    axiosClient.get(`/api/v1/${path}/${identifier}`),
});

export const frontendApi = {
  categories: createResource<"Category">("categories"),

  blocks: {
    ...createResource<"Block">("blocks"),
    random: (): Promise<AxiosResponse<Schema["Block"]>> =>
      axiosClient.get("/api/v1/blocks/random"),
  },
};
