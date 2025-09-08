"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, ArrowLeft, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCreateAgent } from "@/hooks/use-agents"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function NewAgentPage() {
  const router = useRouter()
  const { data: user } = useUser()
  const createAgent = useCreateAgent()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [prompt, setPrompt] = useState("")

  const canCreateAgent = user?.plan === "PRO"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !description.trim() || !prompt.trim()) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não identificado.",
        variant: "destructive",
      })
      return
    }

    try {
      await createAgent.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        prompt: prompt.trim(),
      })

      toast({
        title: "Agente criado",
        description: "Agente criado com sucesso!",
      })

      router.push("/agents")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o agente.",
        variant: "destructive",
      })
    }
  }

  if (!canCreateAgent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Novo Agente</h2>
        </div>

        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            Você precisa do plano PRO para criar agentes.
            <Button variant="link" className="p-0 h-auto ml-2">
              Fazer Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/agents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Novo Agente</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Criar Novo Agente
          </CardTitle>
          <CardDescription>
            Configure seu agente de atendimento automatizado para WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Agente *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Assistente de Vendas"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                Nome que aparecerá para identificar o agente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Agente especializado em vendas e conversões"
                maxLength={200}
              />
              <p className="text-sm text-muted-foreground">
                Breve descrição da função do agente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt de Comportamento *</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Você é um assistente de vendas profissional. Sua função é ajudar clientes a encontrar produtos adequados às suas necessidades..."
                rows={8}
                maxLength={2000}
              />
              <p className="text-sm text-muted-foreground">
                Instruções que definem como o agente deve se comportar e responder
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createAgent.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createAgent.isPending ? "Criando..." : "Criar Agente"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/agents">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 