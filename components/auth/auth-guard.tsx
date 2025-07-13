"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMockSession } from "@/hooks/use-mock-session"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { data: session, isPending } = useMockSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isPending) {
      if (requireAuth && !session) {
        router.push("/auth/login")
      } else if (!requireAuth && session) {
        router.push("/dashboard")
      }
    }
  }, [session, isPending, requireAuth, router, mounted])

  if (!mounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (requireAuth && !session) {
    return null
  }

  if (!requireAuth && session) {
    return null
  }

  return <>{children}</>
}
