"use client"

import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export function useResendConfirmationEmail() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true }
    },
  })
}

export function useSignOut() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new Error(error.message)
      }

      // Limpar dados locais
      localStorage.removeItem("pending-email")
      
      return { success: true }
    },
  })
} 

export function useUpdatePassword() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true }
    },
  })
} 