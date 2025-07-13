import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: () => apiClient.getLeads(),
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => apiClient.getLead(id),
    enabled: !!id,
  })
}
