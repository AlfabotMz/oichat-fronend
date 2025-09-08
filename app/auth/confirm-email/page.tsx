"use client"

import { useEffect, useState } from "react"
import { Mail, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useResendConfirmationEmail } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ConfirmEmailPage() {
  const [email, setEmail] = useState<string>("")
  const [countdown, setCountdown] = useState(60)
  const resendEmail = useResendConfirmationEmail()
  const { toast } = useToast()

  useEffect(() => {
    // Pegar email da URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const emailFromUrl = urlParams.get("email")
    const emailFromStorage = localStorage.getItem("pending-email")
    
    if (emailFromUrl) {
      setEmail(emailFromUrl)
    } else if (emailFromStorage) {
      setEmail(emailFromStorage)
    }

    // Countdown para reenvio
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleResendEmail = async () => {
    if (!email) return

    try {
      await resendEmail.mutateAsync(email)
      setCountdown(60)
      
      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada novamente.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o email. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Confirme seu email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para seu email
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {email && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Email enviado para: <strong>{email}</strong>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Para começar a usar o OIChat, você precisa confirmar sua conta clicando no link 
              que enviamos para seu email.
            </p>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Próximos passos:</span>
              </div>
              <ol className="text-sm text-muted-foreground space-y-1 text-left">
                <li>1. Verifique sua caixa de entrada</li>
                <li>2. Clique no link &quot;Confirmar Minha Conta&quot;</li>
                <li>3. Faça login no OIChat</li>
                <li>4. Comece a criar seus agentes!</li>
              </ol>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleResendEmail} 
              disabled={countdown > 0 || resendEmail.isPending}
              className="w-full"
              variant="outline"
            >
              {countdown > 0 ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Reenviar em {countdown}s
                </>
              ) : resendEmail.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Reenviar email
                </>
              )}
            </Button>

            <Button asChild className="w-full">
              <Link href="/auth/login">
                Já confirmei, fazer login
              </Link>
            </Button>
          </div>

          <div className="border-t pt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Não recebeu o email?</strong><br />
                Verifique sua pasta de spam ou lixeira. Se o problema persistir, 
                entre em contato com nosso suporte.
              </AlertDescription>
            </Alert>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline">
              Voltar para o login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 