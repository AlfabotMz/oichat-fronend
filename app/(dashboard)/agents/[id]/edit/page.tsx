"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bot, ArrowLeft, Save, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAgent, useUpdateAgent } from "@/hooks/use-agents"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface EditAgentPageProps {
  params: {
    id: string
  }
}

export default function EditAgentPage({ params }: EditAgentPageProps) {
  const router = useRouter()
  const { data: user } = useUser()
  const { data: agent, isLoading: isLoadingAgent } = useAgent(params.id)
  const updateAgent = useUpdateAgent()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [prompt, setPrompt] = useState("")

  // Preencher formulário quando os dados do agente carregarem
  useEffect(() => {
    if (agent) {
      setName(agent.name || "")
      setDescription(agent.description || "")
      setPrompt(agent.prompt || "")
    }
  }, [agent])

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

    try {
      await updateAgent.mutateAsync({
        id: params.id,
        data: {
          name: name.trim(),
          description: description.trim(),
          prompt: prompt.trim(),
        },
      })

      toast({
        title: "Agente atualizado",
        description: "Agente atualizado com sucesso!",
      })

      router.push("/agents")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agente.",
        variant: "destructive",
      })
    }
  }

  if (isLoadingAgent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Editar Agente</h2>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Editar Agente</h2>
        </div>

        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            Agente não encontrado.
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
        <h2 className="text-3xl font-bold tracking-tight">Editar Agente</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Editar Agente: {agent.name}
          </CardTitle>
          <CardDescription>
            Modifique as configurações do seu agente de atendimento
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
              <Button type="submit" disabled={updateAgent.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateAgent.isPending ? "Salvando..." : "Salvar Alterações"}
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