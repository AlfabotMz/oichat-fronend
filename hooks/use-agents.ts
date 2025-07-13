import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

export function useAgent(id: string) {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: () => apiClient.getAgent(id),
    enabled: !!id,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      userId: string
      status: "ACTIVE" | "INACTIVE"
      name: string
      description: string
      prompt: string
    }) => apiClient.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: {
        status?: "ACTIVE" | "INACTIVE"
        name?: string
        description?: string
        prompt?: string
      }
    }) => apiClient.updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
  })
}

export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      agentId,
      data,
    }: {
      agentId: string
      data: {
        id: string
        content: string
        fromMe: boolean
        conversationId: string
      }
    }) => apiClient.sendMessage(agentId, data),
  })
}

export function useCreateWhatsAppInstance() {
  return useMutation({
    mutationFn: (data: {
      instance: string
      agentId: string
    }) => apiClient.createWhatsAppInstance(data),
  })
}

export function useCheckWhatsAppConnection(instanceName: string) {
  return useQuery({
    queryKey: ["whatsapp-connection", instanceName],
    queryFn: () => apiClient.checkWhatsAppConnection(instanceName),
    enabled: !!instanceName,
    refetchInterval: 30000, // Check every 30 seconds
  })
}
