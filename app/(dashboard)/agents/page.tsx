"use client"
import { Bot, Plus, Settings, Trash2, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAgents, useUpdateAgent, useDeleteAgent } from "@/hooks/use-agents"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents()
  const { data: user } = useUser()
  const updateAgent = useUpdateAgent()
  const deleteAgent = useDeleteAgent()
  const { toast } = useToast()

  const activeAgents = agents?.filter((agent) => agent.status === "ACTIVE") || []
  const canCreateAgent = user?.plan === "PRO" && (agents?.length || 0) < 3
  const canActivateAgent = user?.plan === "PRO" && activeAgents.length === 0

  const handleToggleAgent = async (agentId: string, currentStatus: string) => {
    if (user?.plan === "FREE") {
      toast({
        title: "Upgrade necessário",
        description: "Você precisa do plano PRO para ativar agentes.",
        variant: "destructive",
      })
      return
    }

    if (currentStatus === "INACTIVE" && activeAgents.length > 0) {
      toast({
        title: "Limite atingido",
        description: "Apenas 1 agente pode estar ativo por vez. Desative o agente atual primeiro.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateAgent.mutateAsync({
        id: agentId,
        data: { status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
      })

      toast({
        title: "Agente atualizado",
        description: `Agente ${currentStatus === "ACTIVE" ? "desativado" : "ativado"} com sucesso.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agente.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm("Tem certeza que deseja excluir este agente?")) {
      try {
        await deleteAgent.mutateAsync(agentId)
        toast({
          title: "Agente excluído",
          description: "Agente removido com sucesso.",
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o agente.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Agentes</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agentes</h2>
          <p className="text-muted-foreground">Gerencie seus agentes de atendimento automatizado</p>
        </div>
        <Button asChild disabled={!canCreateAgent}>
          <Link href="/agents/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agente
          </Link>
        </Button>
      </div>

      {user?.plan === "FREE" && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Você está no plano FREE. Faça upgrade para PRO para criar e ativar agentes.
            <Button variant="link" className="p-0 h-auto ml-2">
              Fazer Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {user?.plan === "PRO" && (
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            Plano PRO: Você pode criar até 3 agentes, mas apenas 1 pode estar ativo por vez. Agentes ativos:{" "}
            {activeAgents.length}/1 | Total: {agents?.length || 0}/3
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents?.map((agent) => (
          <Card key={agent.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {agent.name}
                </CardTitle>
                <Badge variant={agent.status === "ACTIVE" ? "default" : "secondary"}>
                  {agent.status === "ACTIVE" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{agent.prompt}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={agent.status === "ACTIVE"}
                    onCheckedChange={() => handleToggleAgent(agent.id, agent.status)}
                    disabled={user?.plan === "FREE" || updateAgent.isPending}
                  />
                  <span className="text-sm">{agent.status === "ACTIVE" ? "Conectado" : "Desconectado"}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/agents/${agent.id}/edit`}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAgent(agent.id)}
                    disabled={deleteAgent.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || []}

        {(!agents || agents.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum agente criado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie seu primeiro agente para começar a automatizar o atendimento via WhatsApp
              </p>
              <Button asChild disabled={!canCreateAgent}>
                <Link href="/agents/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Agente
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
