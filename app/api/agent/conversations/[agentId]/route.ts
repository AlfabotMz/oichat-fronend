import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
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
    const { message, userId: receivedUserId } = await request.json()

    if (!message || !receivedUserId) {
      return NextResponse.json({ error: "Mensagem e ID do usuário são obrigatórios" }, { status: 400 })
    }

    // =====================================================================
    // AQUI: CHAMADA REAL PARA SUA API DO AGENTE DE IA
    // =====================================================================
    let agentResponseText: string = "";

    try {
      const agentApiBaseUrl = process.env.WHATSAPP_API_BASE_URL; // Usando a mesma base URL da API do WhatsApp
      const agentApiKey = process.env.WHATSAPP_API_KEY; // Usando a mesma chave de API

      if (!agentApiBaseUrl || !agentApiKey) {
        throw new Error("Variáveis de ambiente da API do Agente não configuradas.");
      }

      // Adapte o endpoint conforme sua API do Agente espera (ex: /agent/chat)
      const agentChatEndpoint = `/agent/chat/${agentId}`;
      const agentApiUrl = `${agentApiBaseUrl}${agentChatEndpoint}`;

      const apiResponse = await fetch(agentApiUrl, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${agentApiKey}`, 
        },
        body: JSON.stringify({
          userId: receivedUserId,
          message: message,
          // Outros parâmetros necessários para a conversa com o agente
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || `Erro na API do Agente: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      agentResponseText = data.response; // Sua API deve retornar a resposta do agente aqui

    } catch (apiError) {
      console.error("Erro ao chamar a API do Agente:", apiError);
      agentResponseText = `Desculpe, tive um problema ao processar sua solicitação. (${apiError instanceof Error ? apiError.message : 'Erro desconhecido'})`;
    }

    return NextResponse.json({
      id: Date.now().toString(),
      text: agentResponseText,
      sender: "agent",
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Erro geral ao processar conversa do agente:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}