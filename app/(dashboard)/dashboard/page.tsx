"use client"

import { TrendingUp, Users, Bot, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/ui/metric-card"
import { useMockSession } from "@/hooks/use-mock-session"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const { data: session } = useMockSession()
  const { data: dashboardData, isLoading } = useDashboardData()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const metrics = dashboardData?.metrics || {
    totalLeads: 0,
    totalConversions: 0,
    conversionRate: 0,
    activeAgents: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {session?.user?.name}! Monitore seu atendimento virtual.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Leads"
          value={metrics.totalLeads}
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Conversões"
          value={metrics.totalConversions}
          icon={TrendingUp}
          trend={{ value: 8.2, isPositive: true }}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          trend={{ value: 2.1, isPositive: true }}
        />
        <MetricCard title="Agentes Ativos" value={metrics.activeAgents} icon={Bot} />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agentes
            </CardTitle>
            <CardDescription>Seus agentes de atendimento automatizado</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.agents && dashboardData.agents.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.agents.slice(0, 3).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          agent.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {agent.status === "ACTIVE" ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum agente criado ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Últimos Leads
            </CardTitle>
            <CardDescription>Leads mais recentes capturados</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.leads && dashboardData.leads.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Lead #{lead.whatsapp_lid}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          lead.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : lead.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum lead encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
