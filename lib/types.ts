export interface Agent {
  id: string
  user_id: string
  status: "ACTIVE" | "INACTIVE"
  name: string
  description: string
  prompt: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  content: string
  fromMe: boolean
  conversationId: string
  timestamp?: string
}

export interface WhatsAppInstance {
  instance: string
  agentId: string
  isConnected: boolean
}

export interface ApiError {
  error: string
  details?: Record<string, string>
}

// Mock types for dashboard data (since API doesn't provide these endpoints yet)
export interface DashboardMetrics {
  totalLeads: number
  conversions: number
  conversionRate: number
  averageTime: string
  leadsGrowth: number
  conversionsGrowth: number
  conversionRateGrowth: number
  averageTimeGrowth: number
}

export interface LeadDistribution {
  converted: number
  inProgress: number
  noResponse: number
  failed: number
}

export interface AgentPerformance {
  id: string
  name: string
  avatar: string
  conversions: number
  leadsAttended: number
}
