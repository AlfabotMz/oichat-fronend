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

    // Verificar se o agente existe e pertence ao usuário
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("user_id", user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 })
    }

    // Verificar se o agente está ativo
    if (agent.status !== "ACTIVE") {
      return NextResponse.json({ error: "Agente deve estar ativo para conectar" }, { status: 400 })
    }

    // =====================================================================
    // AQUI: CHAMADA REAL PARA SUA API DO WHATSAPP PARA CRIAR UMA INSTÂNCIA
    // =====================================================================
    let qrCodeBase64: string = "";
    let instanceName: string = `instance_${user.id}_${agentId}`;

    try {
      const whatsappApiBaseUrl = process.env.WHATSAPP_API_BASE_URL; // Variável de ambiente para a URL base
      const whatsappApiKey = process.env.WHATSAPP_API_KEY; // Variável de ambiente para a chave de API

      if (!whatsappApiBaseUrl || !whatsappApiKey) {
        throw new Error("Variáveis de ambiente da API do WhatsApp não configuradas.");
      }

      // Adapte o endpoint conforme sua API espera (ex: /whatsapp/instance/create)
      const whatsappCreateInstanceEndpoint = `/whatsapp/instance/create`; 
      const whatsappApiUrl = `${whatsappApiBaseUrl}${whatsappCreateInstanceEndpoint}`;

      const apiResponse = await fetch(whatsappApiUrl, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${whatsappApiKey}`, 
        },
        body: JSON.stringify({
          userId: user.id,
          agentId: agentId,
          // Outros parâmetros necessários para criar a instância
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || `Erro na API do WhatsApp: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      qrCodeBase64 = data.qrCode; 
      instanceName = data.instance; 

    } catch (apiError) {
      console.error("Erro ao chamar a API do WhatsApp para criar instância:", apiError);
      return NextResponse.json({ error: `Falha ao criar instância do WhatsApp: ${apiError instanceof Error ? apiError.message : 'Erro desconhecido'}` }, { status: 500 });
    }

    // Salvar dados da conexão no Supabase
    const { error: connectionError } = await supabase
      .from("whatsapp_connections")
      .upsert({
        user_id: user.id,
        agent_id: agentId,
        instance_name: instanceName,
        connection_code: qrCodeBase64, 
        status: "PENDING",
        created_at: new Date().toISOString(),
      })

    if (connectionError) {
      console.error("Erro ao salvar conexão no Supabase:", connectionError)
      return NextResponse.json({ error: "Erro ao salvar dados da conexão." }, { status: 500 });
    }

    // Retornar dados da conexão para o frontend
    return NextResponse.json({
      code: qrCodeBase64,
      instance: instanceName,
    })

  } catch (error) {
    console.error("Erro geral ao gerar código WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}