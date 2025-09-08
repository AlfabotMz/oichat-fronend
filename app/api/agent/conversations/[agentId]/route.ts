import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

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
      const agentApiBaseUrl = process.env.WHATSAPP_API_BASE_URL;
      const agentApiKey = process.env.WHATSAPP_API_KEY;

      if (!agentApiBaseUrl) {
        throw new Error("URL base da API do Agente (WHATSAPP_API_BASE_URL) não configurada.");
      }

            const agentApiUrl = `${agentApiBaseUrl}/api/agent/conversation/${agentId}`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (agentApiKey) {
        headers["Authorization"] = `Bearer ${agentApiKey}`;
      }

      const apiResponse = await fetch(agentApiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          id: crypto.randomUUID(),
          content: message,
          fromMe: true,
          conversationId: receivedUserId,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || `Erro na API do Agente: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      agentResponseText = data.content; // Extrai a resposta do campo 'content'

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