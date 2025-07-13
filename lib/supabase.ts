import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types based on your database schema
export interface User {
  id: string
  name: string
  email: string
  created_at: string
  remoteJid?: string
  plan: "FREE" | "PRO"
  plan_start?: string
  plan_end?: string
}

export interface Agent {
  id: string
  user_id: string
  name: string
  description: string
  prompt: string
  created_at: string
  updated_at: string
  status: "ACTIVE" | "INACTIVE"
}

export interface Lead {
  id: string
  user_id: string
  agent_id?: string
  whatsapp_jid: string
  whatsapp_lid: string
  conversion_type?: "ORDER" | "SALE"
  status: "FAILED" | "SUCCESS" | "PENDING" | "FOLLOW_UP" | "LOSE"
  created_at: string
  last_contact_at?: string
  last_agent_message_at?: string
  last_conversion_id?: string
}

export interface Conversion {
  id: string
  lead_id: string
  user_id: string
  agent_id?: string
  type: "ORDER" | "SALE"
  value?: number
  notes?: string
  created_at: string
}
