"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import type { User } from "@/lib/types"

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => apiClient.getUser(),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => apiClient.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}
