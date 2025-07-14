"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Session } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Verifica a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsChecking(false)
    })

    // Escuta por mudanças no estado de autenticação (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsChecking(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isChecking) return

    const isAuthenticated = !!session
    if (requireAuth && !isAuthenticated) {
      router.push(`/auth/login?redirect_to=${pathname}`)
    }
    if (!requireAuth && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isChecking, session, requireAuth, router, pathname])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const isAuthenticated = !!session
  if ((requireAuth && !isAuthenticated) || (!requireAuth && isAuthenticated)) {
    // Estamos prestes a redirecionar, mostramos um loader para evitar piscar o conteúdo
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
