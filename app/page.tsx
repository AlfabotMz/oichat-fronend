"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMockSession } from "@/hooks/use-mock-session"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { data: session, isPending } = useMockSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isPending) {
      if (session) {
        router.push("/dashboard")
      } else {
        router.push("/auth/login")
      }
    }
  }, [session, isPending, router, mounted])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
