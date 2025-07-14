import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { apiClient } from "@/lib/api"

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
    onSuccess: (updatedAgent) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] })
      queryClient.invalidateQueries({ queryKey: ["agent", updatedAgent.id] })
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



export function useCreateWhatsAppInstance() {
  return useMutation({
    mutationFn: async (data: { instance: string; agentId: string }) => {
      const response = await fetch("/api/whatsapp/create-instance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create WhatsApp instance");
      }

      return response.json();
    },
  });
}

export function useConnectWhatsApp() {
  return useMutation({
    mutationFn: async (data: { instance: string; agentId: string }) => {
      const response = await fetch("/api/whatsapp/connect-instance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to connect WhatsApp");
      }

      return response.json();
    },
  });
}

export function useCheckWhatsAppConnectionStatus(instanceName: string) {
  return useQuery({
    queryKey: ["whatsapp-connection-status", instanceName],
    queryFn: async () => {
      const response = await fetch(`/api/whatsapp/status-instance/${instanceName}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check WhatsApp connection status");
      }

      return response.json();
    },
    enabled: !!instanceName,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

export function useWhatsAppConnection(agentId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["whatsapp-connection", agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('agent_id', agentId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      return data;
    },
    enabled: !!agentId,
  });
}
