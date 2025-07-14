"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export function useUser() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error("Usuário não autenticado")
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          const { data: newUser } = await supabase
            .from("users")
            .insert({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || "Usuário",
              email: session.user.email!,
              plan: "FREE",
            })
            .select()
            .single()

          return newUser
        }
        throw error
      }

      return user
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error("Usuário não autenticado")
      }

      const { data: updatedUser, error } = await supabase
        .from("users")
        .update(data)
        .eq("id", session.user.id)
        .select()
        .single()

      if (error) throw error

      return updatedUser
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error("Usuário não autenticado")
      }

      await supabase.from("users").delete().eq("id", session.user.id)
      await supabase.auth.signOut()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}

export function useDisconnectWhatsApp() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error("Usuário não autenticado")
      }

      const { error } = await supabase
        .from("users")
        .update({ remoteJid: null })
        .eq("id", session.user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
} 