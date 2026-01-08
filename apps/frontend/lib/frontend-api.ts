'use client';

import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
});

export const frontendApi = {
  categories: {
    list: () => axiosClient.get("/api/v1/categories"),
    identifier: (identifier: string) =>
      axiosClient.get(`/api/v1/categories/${identifier}`),
  },

  blocks: {
    list: () => axiosClient.get("/api/v1/blocks"),
    identifier: (identifier: string) =>
      axiosClient.get(`/api/v1/blocks/${identifier}`),
    random: () => axiosClient.get("/api/v1/blocks/random"),
  },
};
