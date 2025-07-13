import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AgentPerformanceProps {
  agents: Array<{
    id: string
    name: string
    avatar: string
    conversions: number
    leadsAttended: number
  }>
}

export function AgentPerformance({ agents }: AgentPerformanceProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Desempenho dos agentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {agent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.leadsAttended} leads atendidos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{agent.conversions} Conversões</p>
              <p className="text-xs text-muted-foreground">ID: {agent.id.slice(0, 3)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
