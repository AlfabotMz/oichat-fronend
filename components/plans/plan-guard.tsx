"use client"

import type React from "react"

import { useSession } from "@/lib/auth-client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Crown, Lock } from "lucide-react"

interface PlanGuardProps {
  children: React.ReactNode
  requiredPlan: "FREE" | "PRO"
  fallback?: React.ReactNode
}

export function PlanGuard({ children, requiredPlan, fallback }: PlanGuardProps) {
  const { data: session } = useSession()

  const userPlan = session?.user?.plan || "FREE"
  const hasAccess = requiredPlan === "FREE" || userPlan === "PRO"

  if (!hasAccess) {
    return (
      fallback || (
        <Alert className="border-primary/20 bg-primary/5">
          <Crown className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span>Esta funcionalidade requer o plano PRO.</span>
            <Button size="sm" className="ml-4">
              <Lock className="h-3 w-3 mr-1" />
              Fazer Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
