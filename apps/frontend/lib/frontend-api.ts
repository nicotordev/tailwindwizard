"use client";

import axios, { AxiosResponse } from "axios";
import type { components, paths } from "@/types/api";
import type { 
  License, 
  RenderJob, 
  ExtendedPurchase,
  Block,
  User,
  Creator
} from "@/types/extended";

type Schema = components["schemas"];

type CategoryListParams = paths["/api/v1/categories"]["get"]["parameters"]["query"];
type BlockListParams = paths["/api/v1/blocks"]["get"]["parameters"]["query"];
type BlockRandomParams = paths["/api/v1/blocks/random"]["get"]["parameters"]["query"];
type CreatorBlocksParams =
  paths["/api/v1/creators/me/blocks"]["get"]["parameters"]["query"];
type AdminModerationParams =
  paths["/api/v1/admin/moderation"]["get"]["parameters"]["query"];
type AdminModerationResponse =
  paths["/api/v1/admin/moderation"]["get"]["responses"][200]["content"]["application/json"];
type AdminModerationDecision = NonNullable<
  paths["/api/v1/admin/moderation/{blockId}/decide"]["post"]["requestBody"]
>["content"]["application/json"];
type AdminModerationDecisionResponse =
  paths["/api/v1/admin/moderation/{blockId}/decide"]["post"]["responses"][200]["content"]["application/json"];
type CreatorOnboardingRequest = NonNullable<
  paths["/api/v1/creators/me/onboarding"]["post"]["requestBody"]
>["content"]["application/json"];
type CreatorOnboardingResponse =
  paths["/api/v1/creators/me/onboarding"]["post"]["responses"][200]["content"]["application/json"];

type BundleUploadResponse = {
  id: string;
  fileName: string;
  sha256: string;
  size: number;
};

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

/**
 * Generic helper to reduce boilerplate for standard resource endpoints
 */
const createResource = <T, Params = undefined>(path: string) => ({
  list: (params?: Params): Promise<AxiosResponse<T[]>> =>
    axiosClient.get(`/api/v1/${path}`, { params }),
  identifier: (identifier: string): Promise<AxiosResponse<T>> =>
    axiosClient.get(`/api/v1/${path}/${identifier}`),
});

export const frontendApi = {
  categories: createResource<Schema["Category"], CategoryListParams>("categories"),

  blocks: {
    ...createResource<Block, BlockListParams>("blocks"),
    random: (params?: BlockRandomParams): Promise<AxiosResponse<Block[]>> =>
      axiosClient.get("/api/v1/blocks/random", { params }),
    listMyBlocks: (
      params?: CreatorBlocksParams
    ): Promise<AxiosResponse<Block[]>> =>
      axiosClient.get("/api/v1/creator/blocks", { params }),
    create: (data: Schema["CreateBlock"]): Promise<AxiosResponse<Block>> =>
      axiosClient.post("/api/v1/blocks", data),
    update: (
      id: string,
      data: Schema["UpdateBlock"]
    ): Promise<AxiosResponse<Block>> =>
      axiosClient.patch(`/api/v1/blocks/${id}`, data),
    uploadBundle: (
      id: string,
      data: FormData
    ): Promise<AxiosResponse<BundleUploadResponse>> =>
      axiosClient.post(`/api/v1/blocks/${id}/bundle`, data),
    queuePreview: (id: string): Promise<AxiosResponse<RenderJob>> =>
      axiosClient.post(`/api/v1/blocks/${id}/preview`),
    submit: (id: string): Promise<AxiosResponse<Block>> =>
      axiosClient.post(`/api/v1/blocks/${id}/submit`),
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
    onboard: (
      data: CreatorOnboardingRequest
    ): Promise<AxiosResponse<CreatorOnboardingResponse>> =>
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
      axiosClient.get(`/api/v1/blocks/render-jobs/${jobId}`),
  },

  admin: {
    moderationList: (
      params?: AdminModerationParams
    ): Promise<AxiosResponse<AdminModerationResponse>> =>
      axiosClient.get("/api/v1/admin/moderation", { params }),
    decide: (
      blockId: string,
      data: AdminModerationDecision
    ): Promise<AxiosResponse<AdminModerationDecisionResponse>> =>
      axiosClient.post(`/api/v1/admin/moderation/${blockId}/decide`, data),
  }
};
