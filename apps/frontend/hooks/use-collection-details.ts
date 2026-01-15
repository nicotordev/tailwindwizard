"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Collection } from "@/types/extended";

export function useCollectionDetails(collectionId: string) {
  return useQuery({
    queryKey: ["collection", collectionId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/collections/{id}", {
        params: { path: { id: collectionId } },
      });
      if (error) throw new Error("Failed to fetch collection");
      return data as Collection;
    },
  });
}