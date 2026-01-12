"use client";

import type { components, paths } from "@/types/api";
import type {
  Block,
  Creator,
  ExtendedPurchase,
  License,
  RenderJob,
  User,
} from "@/types/extended";
import axios, { AxiosResponse } from "axios";

type Schema = components["schemas"];

type CategoryListParams =
  paths["/api/v1/categories"]["get"]["parameters"]["query"];
type BlockListParams = paths["/api/v1/blocks"]["get"]["parameters"]["query"];
type BlockRandomParams =
  paths["/api/v1/blocks/random"]["get"]["parameters"]["query"];
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
type AdminCreatorsParams =
  paths["/api/v1/admin/creators"]["get"]["parameters"]["query"];
type AdminCreatorsResponse =
  paths["/api/v1/admin/creators"]["get"]["responses"][200]["content"]["application/json"];
type AdminReviewCreatorRequest = NonNullable<
  paths["/api/v1/admin/creators/{creatorId}/review"]["post"]["requestBody"]
>["content"]["application/json"];
type AdminReviewCreatorResponse =
  paths["/api/v1/admin/creators/{creatorId}/review"]["post"]["responses"][200]["content"]["application/json"];
type CreatorOnboardingRequest = NonNullable<
  paths["/api/v1/creators/me/onboarding"]["post"]["requestBody"]
>["content"]["application/json"];
type CreatorOnboardingResponse =
  paths["/api/v1/creators/me/onboarding"]["post"]["responses"][200]["content"]["application/json"];

type SetupIntentResponse = {
  clientSecret: string;
  customerId: string;
};
type FinishOnboardingRequest = {
  role: "CREATOR" | "BUILDER";
};

type AdminUsersParams =
  paths["/api/v1/admin/users"]["get"]["parameters"]["query"];
type AdminUsersResponse =
  paths["/api/v1/admin/users"]["get"]["responses"][200]["content"]["application/json"];

type AdminPurchaseListParams = {
  status?: string;
  page?: string;
  limit?: string;
};

type AdminPurchaseListResponse = {
  data: (ExtendedPurchase & {
    buyer: {
      id: string;
      name: string | null;
      email: string;
      avatarUrl: string | null;
    };
  })[];
  meta: Schema["PaginationMeta"];
};

type WebhookStatsResponse = {
  last24h: {
    total: number;
    failed: number;
    pending: number;
    successRate: number;
  };
  lastEvents: Record<string, unknown>[];
};

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
  categories: createResource<Schema["Category"], CategoryListParams>(
    "categories"
  ),

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
    updateMe: (data: Schema["UpdateUser"]): Promise<AxiosResponse<User>> =>
      axiosClient.patch("/api/v1/users/me", data),
    createSetupIntent: (): Promise<AxiosResponse<SetupIntentResponse>> =>
      axiosClient.post("/api/v1/users/me/create-setup-intent"),
    finishOnboarding: (
      data: FinishOnboardingRequest
    ): Promise<AxiosResponse<{ success: boolean }>> =>
      axiosClient.post("/api/v1/users/me/finish-onboarding", data),
  },

  creators: {
    onboard: (
      data: CreatorOnboardingRequest
    ): Promise<AxiosResponse<CreatorOnboardingResponse>> =>
      axiosClient.post("/api/v1/creators/onboarding", data),

    createMe: (
      data: Schema["CreateCreator"]
    ): Promise<AxiosResponse<Creator>> =>
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
    creators: {
      list: (
        params?: AdminCreatorsParams
      ): Promise<AxiosResponse<AdminCreatorsResponse>> =>
        axiosClient.get("/api/v1/admin/creators", { params }),
    },
    reviewCreator: (
      creatorId: string,
      data: AdminReviewCreatorRequest
    ): Promise<AxiosResponse<AdminReviewCreatorResponse>> =>
      axiosClient.post(`/api/v1/admin/creators/${creatorId}/review`, data),

    // User management
    users: {
      list: (
        params?: AdminUsersParams
      ): Promise<AxiosResponse<AdminUsersResponse>> =>
        axiosClient.get("/api/v1/admin/users", { params }),
      updateRole: (
        userId: string,
        role: Schema["User"]["role"]
      ): Promise<AxiosResponse<User>> =>
        axiosClient.patch(`/api/v1/admin/users/${userId}/role`, { role }),
    },

    // Category management
    categories: {
      list: (): Promise<AxiosResponse<Schema["Category"][]>> =>
        axiosClient.get("/api/v1/admin/categories"),
      create: (
        data: Partial<Schema["Category"]>
      ): Promise<AxiosResponse<Schema["Category"]>> =>
        axiosClient.post("/api/v1/admin/categories", data),
      update: (
        id: string,
        data: Partial<Schema["Category"]>
      ): Promise<AxiosResponse<Schema["Category"]>> =>
        axiosClient.patch(`/api/v1/admin/categories/${id}`, data),
      delete: (id: string): Promise<AxiosResponse<{ success: boolean }>> =>
        axiosClient.delete(`/api/v1/admin/categories/${id}`),
    },

    // Tag management
    tags: {
      list: (): Promise<AxiosResponse<Schema["Tag"][]>> =>
        axiosClient.get("/api/v1/admin/tags"),
      create: (
        data: Partial<Schema["Tag"]>
      ): Promise<AxiosResponse<Schema["Tag"]>> =>
        axiosClient.post("/api/v1/admin/tags", data),
      update: (
        id: string,
        data: Partial<Schema["Tag"]>
      ): Promise<AxiosResponse<Schema["Tag"]>> =>
        axiosClient.patch(`/api/v1/admin/tags/${id}`, data),
      delete: (id: string): Promise<AxiosResponse<{ success: boolean }>> =>
        axiosClient.delete(`/api/v1/admin/tags/${id}`),
    },

    // Finance
    finance: {
      listPurchases: (
        params?: AdminPurchaseListParams
      ): Promise<AxiosResponse<AdminPurchaseListResponse>> =>
        axiosClient.get("/api/v1/admin/purchases", { params }),
      getWebhookStats: (): Promise<AxiosResponse<WebhookStatsResponse>> =>
        axiosClient.get("/api/v1/admin/finance/webhooks"),
    },
  },
};
