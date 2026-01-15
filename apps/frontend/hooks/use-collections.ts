"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { frontendApi } from "@/lib/frontend-api";
import { Collection } from "@/types/extended";

export function useCollections() {
  const queryClient = useQueryClient();

  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      try {
        const response = await frontendApi.collections.list();
        return response.data as Collection[];
      } catch (error) {
        throw new Error("Failed to fetch collections");
      }
    },
  });

  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      try {
        await frontendApi.collections.delete(id);
      } catch (error) {
        throw new Error("Failed to delete collection");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const createCollection = useMutation({
    mutationFn: async (values: {
      name: string;
      description?: string;
      visibility: "PRIVATE" | "UNLISTED" | "PUBLIC";
    }) => {
      try {
        const response = await frontendApi.collections.create(values);
        return response.data;
      } catch (error) {
        throw new Error("Failed to create collection");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const updateCollection = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: {
        name?: string;
        description?: string;
        visibility?: "PRIVATE" | "UNLISTED" | "PUBLIC";
      };
    }) => {
      try {
        const response = await frontendApi.collections.update(id, values);
        return response.data;
      } catch (error) {
        throw new Error("Failed to update collection");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collection", variables.id] });
    },
  });

  const removeBlock = useMutation({
    mutationFn: async ({
      collectionId,
      blockId,
    }: {
      collectionId: string;
      blockId: string;
    }) => {
      try {
        await frontendApi.collections.removeBlock(collectionId, blockId);
      } catch (error) {
        throw new Error("Failed to remove block");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["collection", variables.collectionId],
      });
    },
  });

  const addBlock = useMutation({
    mutationFn: async ({
      collectionId,
      blockId,
    }: {
      collectionId: string;
      blockId: string;
    }) => {
      try {
        await frontendApi.collections.addBlock(collectionId, blockId);
      } catch (error) {
        throw new Error("Failed to add block to collection");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["collection", variables.collectionId],
      });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  return {
    ...collectionsQuery,
    deleteCollection,
    createCollection,
    updateCollection,
    removeBlock,
    addBlock,
  };
}