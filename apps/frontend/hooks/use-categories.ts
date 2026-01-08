import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useCategories() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await apiClient.GET("/api/v1/categories");
        return response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    },
  });

  return categoriesQuery;
}

export function useCategory(slug: string) {
  const categoryQuery = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      try {
        const response = await apiClient.GET("/api/v1/categories/:slug", {
          params: {
            path: {
              slug,
            },
          },
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching category:", error);
        throw error;
      }
    },
  });

  return categoryQuery;
}
