import { useQuery } from "@tanstack/react-query"
import { useMockSession } from "@/hooks/use-mock-session"

// Mock data para desenvolvimento no v0
const mockDashboardData = {
  leads: [
    {
      id: "1",
      user_id: "user1",
      whatsapp_jid: "5511999999999@s.whatsapp.net",
      whatsapp_lid: "001",
      status: "SUCCESS" as const,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_id: "user1",
      whatsapp_jid: "5511888888888@s.whatsapp.net",
      whatsapp_lid: "002",
      status: "PENDING" as const,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      user_id: "user1",
      whatsapp_jid: "5511777777777@s.whatsapp.net",
      whatsapp_lid: "003",
      status: "SUCCESS" as const,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  conversions: [
    {
      id: "1",
      lead_id: "1",
      user_id: "user1",
      type: "SALE" as const,
      value: 150.0,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      lead_id: "3",
      user_id: "user1",
      type: "ORDER" as const,
      value: 89.99,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
  agents: [
    {
      id: "1",
      user_id: "user1",
      name: "Assistente de Vendas",
      description: "Agente especializado em vendas e conversões",
      prompt: "Você é um assistente de vendas...",
      status: "ACTIVE" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      user_id: "user1",
      name: "Suporte Técnico",
      description: "Agente para suporte e dúvidas técnicas",
      prompt: "Você é um assistente de suporte...",
      status: "INACTIVE" as const,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
}

export function useDashboardData() {
  const { data: session } = useMockSession()
  const userId = session?.user?.id

  return useQuery({
    queryKey: ["dashboard-data", userId],
    queryFn: async () => {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { leads, conversions, agents } = mockDashboardData

      // Calculate metrics
      const totalLeads = leads.length
      const totalConversions = conversions.length
      const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0
      const activeAgents = agents.filter((agent) => agent.status === "ACTIVE")

      return {
        leads,
        conversions,
        agents,
        metrics: {
          totalLeads,
          totalConversions,
          conversionRate,
          activeAgents: activeAgents.length,
        },
      }
    },
    enabled: !!userId,
  })
}
