import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function MetricCard({ title, value, description, icon: Icon, trend, className = "" }: MetricCardProps) {
  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/40 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        {trend && (
          <div className={`text-xs font-medium ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>
            {trend.isPositive ? "+" : ""}
            {trend.value}% vs período anterior
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
