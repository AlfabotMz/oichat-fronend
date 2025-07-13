"use client"

import { useState, useEffect } from "react"

interface MockUser {
  id: string
  name: string
  email: string
  plan: string
}

interface MockSession {
  user: MockUser
}

export function useMockSession() {
  const [session, setSession] = useState<MockSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há sessão salva no localStorage
    const checkSession = () => {
      if (typeof window !== "undefined") {
        const savedSession = localStorage.getItem("mock-session")
        if (savedSession) {
          try {
            setSession(JSON.parse(savedSession))
          } catch (error) {
            console.error("Erro ao carregar sessão:", error)
            localStorage.removeItem("mock-session")
          }
        }
      }
      setIsLoading(false)
    }

    checkSession()
  }, [])

  const signOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mock-session")
    }
    setSession(null)
  }

  return {
    data: session,
    isPending: isLoading,
    signOut,
  }
}
