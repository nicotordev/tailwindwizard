import { useQuery } from "@tanstack/react-query";
import {frontendApi} from "@/lib/frontend-api";


export function useCategories() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await frontendApi.categories.list();
        // response.error is inferred as never by openapi-fetch if 200 is the only response
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
        const response = await frontendApi.categories.identifier(slug);
        return response.data;
      } catch (error) {
        console.error("Error fetching category:", error);
        throw error;
      }
    },
  });

  return categoryQuery;
}
