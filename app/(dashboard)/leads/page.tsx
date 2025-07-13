"use client"

import { useState } from "react"
import { Search, Eye, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLeads } from "@/hooks/use-leads"
import { useAgents } from "@/hooks/use-agents"
import Link from "next/link"

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  FOLLOW_UP: "bg-blue-100 text-blue-800",
  LOSE: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  PENDING: "Pendente",
  SUCCESS: "Convertido",
  FAILED: "Falhou",
  FOLLOW_UP: "Follow-up",
  LOSE: "Perdido",
}

export default function LeadsPage() {
  const { data: leads, isLoading } = useLeads()
  const { data: agents } = useAgents()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const filteredLeads =
    leads?.filter((lead) => {
      const matchesSearch = lead.whatsapp_lid.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter

      let matchesDate = true
      if (dateFilter !== "all") {
        const leadDate = new Date(lead.created_at)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (dateFilter) {
          case "7":
            matchesDate = daysDiff <= 7
            break
          case "30":
            matchesDate = daysDiff <= 30
            break
          case "90":
            matchesDate = daysDiff <= 90
            break
        }
      }

      return matchesSearch && matchesStatus && matchesDate
    }) || []

  const getAgentName = (agentId?: string) => {
    if (!agentId) return "Não atribuído"
    const agent = agents?.find((a) => a.id === agentId)
    return agent?.name || "Agente não encontrado"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
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
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">Gerencie todos os leads capturados pelos seus agentes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre os leads por status, data ou termo de busca</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID do lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="SUCCESS">Convertido</SelectItem>
                <SelectItem value="FAILED">Falhou</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                <SelectItem value="LOSE">Perdido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Lead #{lead.whatsapp_lid}</h3>
                      <Badge className={statusColors[lead.status]}>{statusLabels[lead.status]}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Agente: {getAgentName(lead.agent_id)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </span>
                      {lead.last_contact_at && (
                        <>
                          <span>•</span>
                          <span>Último contato: {new Date(lead.last_contact_at).toLocaleDateString("pt-BR")}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/leads/${lead.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum lead encontrado</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Tente ajustar os filtros para encontrar leads"
                  : "Seus agentes ainda não capturaram nenhum lead"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-center pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredLeads.length} de {leads?.length || 0} leads
          </p>
        </div>
      )}
    </div>
  )
}
