import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

export function useConversions() {
  return useQuery({
    queryKey: ["conversions"],
    queryFn: () => apiClient.getConversions(),
  })
}
