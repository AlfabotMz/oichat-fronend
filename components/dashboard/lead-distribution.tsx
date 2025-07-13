import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LeadDistributionProps {
  data: {
    converted: number
    inProgress: number
    noResponse: number
    failed: number
  }
}

export function LeadDistribution({ data }: LeadDistributionProps) {
  const total = data.converted + data.inProgress + data.noResponse + data.failed

  const items = [
    {
      label: "Convertido",
      value: data.converted,
      percentage: ((data.converted / total) * 100).toFixed(1),
      color: "bg-green-500",
    },
    {
      label: "Em Progresso",
      value: data.inProgress,
      percentage: ((data.inProgress / total) * 100).toFixed(1),
      color: "bg-blue-500",
    },
    {
      label: "Sem resposta",
      value: data.noResponse,
      percentage: ((data.noResponse / total) * 100).toFixed(1),
      color: "bg-yellow-500",
    },
    {
      label: "Falhado",
      value: data.failed,
      percentage: ((data.failed / total) * 100).toFixed(1),
      color: "bg-red-500",
    },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Distribuição</CardTitle>
        <p className="text-sm text-muted-foreground">Status dos Leads</p>
        <p className="text-xs text-muted-foreground">Distribuição por categoria</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-foreground">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-foreground">{item.value}</span>
                <span className="text-muted-foreground ml-1">({item.percentage}%)</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
