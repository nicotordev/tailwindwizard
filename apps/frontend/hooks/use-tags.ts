import { frontendApi } from "@/lib/frontend-api";
import { useQuery } from "@tanstack/react-query";

export function useTags() {
  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      try {
        const response = await frontendApi.tags.list();
        return response.data;
      } catch (error) {
        console.error("Error fetching tags:", error);
        throw error;
      }
    },
  });

  return tagsQuery;
}
