"use client"

import type React from "react"

import { useState } from "react"
import { User, CreditCard, Smartphone, Trash2, LogOut } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUser, useUpdateUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { data: user, isLoading } = useUser()
  const updateUser = useUpdateUser()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateUser.mutateAsync({ name, email })
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      })
    }
  }

  const handleDisconnectWhatsApp = () => {
    // Implementar lógica de desconexão do WhatsApp
    toast({
      title: "WhatsApp desconectado",
      description: "Sua conta foi desconectada do WhatsApp.",
    })
  }

  const handleDeleteAccount = () => {
    if (confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
      // Implementar lógica de exclusão da conta
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Atualize suas informações básicas de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano e Assinatura
            </CardTitle>
            <CardDescription>Informações sobre seu plano atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Plano Atual</p>
                <p className="text-sm text-muted-foreground">
                  {user?.plan === "PRO" ? "Plano Profissional" : "Plano Gratuito"}
                </p>
              </div>
              <Badge variant={user?.plan === "PRO" ? "default" : "secondary"}>{user?.plan}</Badge>
            </div>

            {user?.plan === "PRO" && user?.plan_end && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Válido até: {new Date(user.plan_end).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}

            {user?.plan === "FREE" && (
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  Faça upgrade para o plano PRO e desbloqueie recursos avançados como múltiplos agentes.
                  <Button variant="link" className="p-0 h-auto ml-2">
                    Fazer Upgrade
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Conexão WhatsApp
            </CardTitle>
            <CardDescription>Gerencie a conexão com sua conta do WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status da Conexão</p>
                <p className="text-sm text-muted-foreground">{user?.remoteJid ? "Conectado" : "Desconectado"}</p>
              </div>
              <Badge variant={user?.remoteJid ? "default" : "secondary"}>
                {user?.remoteJid ? "Conectado" : "Desconectado"}
              </Badge>
            </div>

            {user?.remoteJid && (
              <div>
                <p className="text-sm text-muted-foreground">JID: {user.remoteJid}</p>
              </div>
            )}

            <Button variant="outline" onClick={handleDisconnectWhatsApp} disabled={!user?.remoteJid}>
              <LogOut className="h-4 w-4 mr-2" />
              Desconectar WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>Ações irreversíveis que afetam permanentemente sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Trash2 className="h-4 w-4" />
              <AlertDescription>
                Excluir sua conta removerá permanentemente todos os seus dados, incluindo agentes, leads e conversões.
                Esta ação não pode ser desfeita.
              </AlertDescription>
            </Alert>

            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
