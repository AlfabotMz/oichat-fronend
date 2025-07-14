import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const agentId = params.agentId

    // Buscar conexão existente para este agente e usuário
    const { data: connection, error } = await supabase
      .from("whatsapp_connections")
      .select("*")
      .eq("agent_id", agentId)
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") { // PGRST116 = No rows found
      console.error("Erro ao buscar conexão existente:", error)
      return NextResponse.json({ error: "Erro ao verificar instância existente." }, { status: 500 })
    }

    if (connection) {
      return NextResponse.json({ exists: true, connection: connection })
    } else {
      return NextResponse.json({ exists: false })
    }

  } catch (error) {
    console.error("Erro geral ao verificar instância do WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
