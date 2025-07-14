import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { instance: string } }
) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const instanceName = params.instance

    // =====================================================================
    // AQUI: CHAMADA REAL PARA SUA API DO WHATSAPP PARA VERIFICAR O STATUS
    // =====================================================================
    let isConnected: boolean = false;

    try {
      const whatsappApiBaseUrl = process.env.WHATSAPP_API_BASE_URL; // Variável de ambiente para a URL base
      const whatsappApiKey = process.env.WHATSAPP_API_KEY; // Variável de ambiente para a chave de API

      if (!whatsappApiBaseUrl || !whatsappApiKey) {
        throw new Error("Variáveis de ambiente da API do WhatsApp não configuradas.");
      }

      // Adapte o endpoint conforme sua API espera (ex: /whatsapp/instance/status)
      const whatsappStatusEndpoint = `/whatsapp/instance/status/${instanceName}`;
      const whatsappApiUrl = `${whatsappApiBaseUrl}${whatsappStatusEndpoint}`;

      const apiResponse = await fetch(whatsappApiUrl, {
        method: "GET", 
        headers: {
          "Authorization": `Bearer ${whatsappApiKey}`, 
        },
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || `Erro na API do WhatsApp: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      isConnected = data.isConnected; 

    } catch (apiError) {
      console.error("Erro ao chamar a API do WhatsApp para verificar status:", apiError);
      isConnected = false;
    }

    // Retornar dados da conexão
    return NextResponse.json({
      isConnected: isConnected,
    })

  } catch (error) {
    console.error("Erro geral ao verificar status WhatsApp:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
