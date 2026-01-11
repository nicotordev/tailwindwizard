"use client";

import axios, { AxiosResponse } from "axios";
import type { components } from "@/types/api";
import type { 
  License, 
  RenderJob, 
  ExtendedPurchase,
  Block,
  User,
  Creator
} from "@/types/extended";

type Schema = components["schemas"];

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

/**
 * Generic helper to reduce boilerplate for standard resource endpoints
 */
const createResource = <T>(path: string) => ({
  list: (): Promise<AxiosResponse<T[]>> =>
    axiosClient.get(`/api/v1/${path}`),
  identifier: (identifier: string): Promise<AxiosResponse<T>> =>
    axiosClient.get(`/api/v1/${path}/${identifier}`),
});

export const frontendApi = {
  categories: createResource<Schema["Category"]>("categories"),

  blocks: {
    ...createResource<Block>("blocks"),
    random: (): Promise<AxiosResponse<Block>> =>
      axiosClient.get("/api/v1/blocks/random"),
    listMyBlocks: (): Promise<AxiosResponse<Block[]>> =>
      axiosClient.get("/api/v1/creator/blocks"),
    create: (data: Schema["CreateBlock"]): Promise<AxiosResponse<Block>> =>
      axiosClient.post("/api/v1/blocks", data),
    update: (id: string, data: Schema["UpdateBlock"]): Promise<AxiosResponse<Block>> =>
      axiosClient.patch(`/api/v1/blocks/${id}`, data),
  },

  users: {
    getMe: (): Promise<AxiosResponse<User>> =>
      axiosClient.get("/api/v1/users/me"),
    updateMe: (
      data: Schema["UpdateUser"]
    ): Promise<AxiosResponse<User>> =>
      axiosClient.patch("/api/v1/users/me", data),
  },

  creators: {
    onboard: (data: {
      returnUrl: string;
      refreshUrl: string;
    }): Promise<AxiosResponse<{ url: string }>> =>
      axiosClient.post("/api/v1/creators/onboarding", data),
    
    createMe: (data: Schema["CreateCreator"]): Promise<AxiosResponse<Creator>> =>
      axiosClient.post("/api/v1/creators/me", data),
      
    getMe: (): Promise<AxiosResponse<Creator>> => 
      axiosClient.get("/api/v1/creators/me"),
  },

  licenses: {
    list: (): Promise<AxiosResponse<License[]>> =>
      axiosClient.get("/api/v1/licenses"),
  },

  purchases: {
    list: (): Promise<AxiosResponse<ExtendedPurchase[]>> =>
      axiosClient.get("/api/v1/purchases"),
    identifier: (id: string): Promise<AxiosResponse<ExtendedPurchase>> =>
      axiosClient.get(`/api/v1/purchases/${id}`),
  },

  render: {
    status: (jobId: string): Promise<AxiosResponse<RenderJob>> =>
      axiosClient.get(`/api/v1/render/${jobId}`),
  },

  admin: {
    moderationList: (): Promise<AxiosResponse<Block[]>> =>
      axiosClient.get("/api/v1/admin/moderation"),
    decide: (blockId: string, data: { decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES", notes?: string }): Promise<AxiosResponse<void>> =>
      axiosClient.post(`/api/v1/admin/moderation/${blockId}/decide`, data),
  }
};
