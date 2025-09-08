const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

import type { Agent, WebMessage } from "@/lib/types"
import type { User, Lead, Conversion } from "@/lib/supabase"

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `API Error: ${response.status}`);
      (error as any).data = errorData; // Attach the full errorData
      throw error;
    }

    return response.json()
  }

  // Agent endpoints
  async createAgent(data: {
    user_id: string
    status: "ACTIVE" | "INACTIVE"
    name: string
    description: string
    prompt: string
  }) {
    return this.request("/api/agent/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getAgents(): Promise<Agent[]> {
    return this.request("/api/agents")
  }

  async getAgent(id: string) {
    return this.request(`/api/agent/${id}`)
  }

  async updateAgent(
    id: string,
    data: {
      status?: "ACTIVE" | "INACTIVE"
      name?: string
      description?: string
      prompt?: string
    },
  ) {
    return this.request(`/api/agent/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteAgent(id: string) {
    return this.request(`/api/agent/${id}`, {
      method: "DELETE",
    })
  }

  // User endpoints
  async getUser(): Promise<User> {
    return this.request("/api/user")
  }

  async updateUser(data: Partial<User>): Promise<User> {
    return this.request("/api/user", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteUser(): Promise<void> {
    return this.request("/api/user", {
      method: "DELETE",
    })
  }

  async disconnectWhatsApp(): Promise<void> {
    return this.request("/api/whatsapp/disconnect", {
      method: "POST",
    })
  }

  async connectWhatsApp(instance: string): Promise<{ data: { pairingCode: string; code: string; count: number } }> {
    return this.request("/api/whatsapp/connect", {
      method: "POST",
      body: JSON.stringify({ instance }),
    })
  }

  // Lead endpoints
  async getLeads(): Promise<Lead[]> {
    return this.request("/api/leads")
  }

  async getLead(id: string): Promise<Lead> {
    return this.request(`/api/leads/${id}`)
  }

  // Conversion endpoints
  async getConversions(): Promise<Conversion[]> {
    return this.request("/api/conversions")
  }

  // Conversation endpoints
  async sendMessage(
    agentId: string,
    data: {
      message: string
      userId: string
    },
  ): Promise<WebMessage> {
    return this.request(`/api/agent/conversations/${agentId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteConversation(agentId: string, conversationId: string) {
    return this.request(`/api/agent/conversation/${agentId}/${conversationId}`, {
      method: "DELETE",
    })
  }

  // WhatsApp endpoints
  async createWhatsAppInstance(data: {
    instance: string
    agentId: string
  }) {
        return this.request("/api/whatsapp/create-instance", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async checkWhatsAppConnection(instanceName: string) {
    return this.request(`/api/whatsapp/check/${instanceName}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
