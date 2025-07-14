import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export function useAgent(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["agent", id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useAgents() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    },
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      description: string
      prompt: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { data: agent, error } = await supabase
        .from("agents")
        .insert({
          user_id: user.id,
          status: "INACTIVE",
          ...data,
        })
        .select()
        .single()

      if (error) throw error
      return agent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
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
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { data: agent, error } = await supabase
        .from("agents")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error
      return agent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Usuário não autenticado")
      }

      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
    },
  })
}

export function useGenerateWhatsAppCode() {
  return useMutation({
    mutationFn: async (agentId: string) => {
      const response = await fetch(`/api/whatsapp/generate-code/${agentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao gerar código")
      }

      return response.json()
    },
  })
}

export function useCheckWhatsAppStatus() {
  return useMutation({
    mutationFn: async (instance: string) => {
      const response = await fetch(`/api/whatsapp/status/${instance}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao verificar status")
      }

      return response.json()
    },
  })
}

export function useCheckWhatsAppInstance(agentId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ["whatsapp-instance-check", agentId],
    queryFn: async () => {
      const response = await fetch(`/api/whatsapp/instance-check/${agentId}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao verificar instância do WhatsApp")
      }

      return response.json()
    },
    enabled: !!agentId,
  })
}
