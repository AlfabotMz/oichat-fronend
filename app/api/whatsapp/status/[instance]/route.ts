import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { instance: string } }
) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const instanceName = params.instance

    // Buscar dados da conexão
    const { data: connection, error: connectionError } = await supabase
      .from("whatsapp_connections")
      .select("*")
      .eq("instance_name", instanceName)
      .eq("user_id", session.user.id)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json({ error: "Conexão não encontrada" }, { status: 404 })
    }

    // Simular verificação de status (você pode integrar com API real do WhatsApp)
    // Por enquanto, vamos simular que a conexão foi estabelecida após alguns segundos
    const timeSinceCreation = Date.now() - new Date(connection.created_at).getTime()
    const isConnected = timeSinceCreation > 10000 // 10 segundos após criação

    // Se conectado, atualizar status
    if (isConnected && connection.status === "PENDING") {
      await supabase
        .from("whatsapp_connections")
        .update({ status: "CONNECTED" })
        .eq("id", connection.id)

      // Atualizar remoteJid do usuário
      await supabase
        .from("users")
        .update({ remoteJid: connection.connection_code })
        .eq("id", session.user.id)
    }

    return NextResponse.json({
      isConnected: isConnected || connection.status === "CONNECTED",
      status: isConnected ? "CONNECTED" : connection.status,
      instance: instanceName,
      connectionCode: connection.connection_code,
    })

  } catch (error) {
    console.error("Erro ao verificar status WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 