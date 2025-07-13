"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Simulação de autenticação para desenvolvimento no v0
const mockAuth = {
  signIn: async (email: string, password: string) => {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email && password) {
      const user = {
        id: "mock-user-id",
        name: "Usuário Demo",
        email: email,
        plan: "PRO",
      }

      // Salvar no localStorage para persistir entre navegações
      if (typeof window !== "undefined") {
        localStorage.setItem("mock-session", JSON.stringify({ user }))
      }

      return { success: true, user }
    }

    throw new Error("Credenciais inválidas")
  },
}

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await mockAuth.signIn(email, password)

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      })

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo ao OiChat</CardTitle>
          <CardDescription>Faça login para acessar sua plataforma de atendimento WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link href="/auth/register" className="text-primary hover:underline">
                Criar conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
