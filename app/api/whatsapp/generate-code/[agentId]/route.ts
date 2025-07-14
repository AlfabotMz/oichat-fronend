import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const agentId = params.agentId

    // Verificar se o agente existe e pertence ao usuário
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("user_id", session.user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 })
    }

    // Verificar se o agente está ativo
    if (agent.status !== "ACTIVE") {
      return NextResponse.json({ error: "Agente deve estar ativo para conectar" }, { status: 400 })
    }

    // Gerar código único para a conexão
    const connectionCode = `oichat_${session.user.id}_${agentId}_${Date.now()}`
    const instanceName = `instance_${session.user.id}_${agentId}`

    // Salvar dados da conexão (você pode criar uma tabela para isso)
    const { error: connectionError } = await supabase
      .from("whatsapp_connections")
      .upsert({
        user_id: session.user.id,
        agent_id: agentId,
        instance_name: instanceName,
        connection_code: connectionCode,
        status: "PENDING",
        created_at: new Date().toISOString(),
      })

    if (connectionError) {
      console.error("Erro ao salvar conexão:", connectionError)
    }

    // Retornar dados da conexão
    return NextResponse.json({
      code: connectionCode,
      instance: instanceName,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(connectionCode)}`,
    })

  } catch (error) {
    console.error("Erro ao gerar código WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 