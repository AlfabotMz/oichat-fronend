"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from "next/navigation"
import { Bot, ArrowLeft, Smartphone, CheckCircle, XCircle, RefreshCw, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QRCode } from "@/components/ui/qr-code"
import { useAgent, useCreateWhatsAppInstance, useConnectWhatsApp, useCheckWhatsAppConnectionStatus, useWhatsAppConnection } from "@/hooks/use-agents"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface ConnectAgentPageProps {
  params: {
    id: string
  }
}

export default function ConnectAgentPage({ params }: ConnectAgentPageProps) {
  console.log("ConnectAgentPage rendered. params.id:", params.id)
  const router = useRouter()
  const { data: user } = useUser()
  const { data: agent, isLoading: isLoadingAgent, refetch: refetchAgent } = useAgent(params.id)
  const { data: whatsappConnection, isLoading: isLoadingWhatsappConnection, refetch: refetchWhatsappConnection } = useWhatsAppConnection(params.id)

  useEffect(() => {
    refetchAgent()
    refetchWhatsappConnection()
  }, [refetchAgent, refetchWhatsappConnection])
  const createInstance = useCreateWhatsAppInstance()
  const connectWhatsApp = useConnectWhatsApp()
  
  const { toast } = useToast()

  const [qrCodeData, setQrCodeData] = useState<{ code: string; instance: string } | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const { data: connectionStatusData } = useCheckWhatsAppConnectionStatus(qrCodeData?.instance || '')
  const [timeElapsed, setTimeElapsed] = useState(0)

  const canConnect = user?.plan === "PRO" && agent?.status === "ACTIVE"
  console.log("Agent object:", agent)
  console.log("User plan:", user?.plan)
  console.log("Can connect:", canConnect)

  const generateQRCode = async () => {
    console.log("generateQRCode called.")
    if (!agent) return

    if (whatsappConnection?.status === "CONNECTED") {
      toast({
        title: "Agente já conectado",
        description: "Este agente já está conectado ao WhatsApp.",
        variant: "default",
      })
      return
    }

    try {
      setConnectionStatus("connecting")
      setTimeElapsed(0)

      let currentInstanceName = whatsappConnection?.instance_name;

      if (!currentInstanceName) {
        // 1. Create WhatsApp Instance if no existing instance
        const newInstanceName = uuidv4();
        await createInstance.mutateAsync({
          instance: newInstanceName,
          agentId: agent.id,
        });
        currentInstanceName = newInstanceName;
      }

      // 2. Connect WhatsApp and get QR code
      const result = await connectWhatsApp.mutateAsync({
        instance: currentInstanceName,
        agentId: agent.id,
      });
      setQrCodeData({
        code: result.data.code,
        instance: currentInstanceName,
      });

    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Erro",
        description: "Não foi possível gerar o código de conexão. Verifique se a instância já existe ou tente novamente.",
        variant: "destructive",
      })
      console.error("Error generating QR code:", error)
    }
  }

  

  // Efeito para inicializar o estado da conexão e monitorar mudanças
  useEffect(() => {
    if (whatsappConnection && whatsappConnection.connection_code && !qrCodeData) {
      setQrCodeData({
        code: whatsappConnection.connection_code,
        instance: whatsappConnection.instance_name,
      });
      setConnectionStatus(whatsappConnection.status === "CONNECTED" ? "connected" : "connecting");
    }

    if (connectionStatusData?.isConnected && connectionStatus !== "connected") {
      setConnectionStatus("connected");
      toast({
        title: "Conectado!",
        description: "WhatsApp conectado com sucesso!",
      });
      setTimeout(() => {
        router.push("/agents");
      }, 2000);
    } else if (qrCodeData && !connectionStatusData?.isConnected && connectionStatus !== "connecting") {
      setConnectionStatus("connecting");
    }
  }, [whatsappConnection, connectionStatusData, qrCodeData, router, toast, connectionStatus]);

  // Timer para mostrar tempo decorrido
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (qrCodeData && connectionStatus === "connecting") {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [qrCodeData, connectionStatus])

  

  

  if (isLoadingAgent || isLoadingWhatsappConnection) {
    console.log("Rendering loading state.")
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Conectar WhatsApp</h2>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!agent) {
    console.log("Rendering agent not found state.")
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Conectar WhatsApp</h2>
        </div>

        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            Agente não encontrado.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!canConnect) {
    console.log("Rendering cannot connect state.")
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Conectar WhatsApp</h2>
        </div>

        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            {user?.plan === "FREE" 
              ? "Você precisa do plano PRO para conectar agentes ao WhatsApp."
              : "O agente precisa estar ativo para ser conectado ao WhatsApp."
            }
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  console.log("Rendering main content.")
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/agents">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Conectar WhatsApp</h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {whatsappConnection?.status === "CONNECTED" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Agente {agent.name} conectado ao WhatsApp
              </CardTitle>
              <CardDescription>
                Este agente já está conectado e pronto para interagir com seus clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/agents")}>
                Voltar para Agentes
              </Button>
            </CardContent>
          </Card>
        ) : (
          !qrCodeData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Criar Instância do WhatsApp para {agent.name}
                </CardTitle>
                <CardDescription>
                  Uma instância do WhatsApp será criada para este agente. Isso permitirá que ele se conecte ao WhatsApp.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={generateQRCode} disabled={createInstance.isPending}>
                  {createInstance.isPending ? "Criando Instância..." : "Criar Instância do WhatsApp"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Conectar {agent.name} ao WhatsApp
                </CardTitle>
                <CardDescription>
                  Escaneie o QR Code com seu WhatsApp para conectar o agente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Status da Conexão</p>
                    <p className="text-sm text-muted-foreground">
                      {connectionStatus === "idle" && "Aguardando geração do código..."}
                      {connectionStatus === "connecting" && `Aguardando conexão... (${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')})`}
                      {connectionStatus === "connected" && "WhatsApp conectado com sucesso!"}
                      {connectionStatus === "error" && "Erro ao gerar código de conexão"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {connectionStatus === "connected" && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {connectionStatus === "error" && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {connectionStatus === "connecting" && (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </div>

                {connectionStatus === "error" && (
                  <Button onClick={generateQRCode} disabled={connectWhatsApp.isPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        )}

        {qrCodeData && connectionStatus !== "error" && (
          <div className="space-y-6">
            <QRCode
              value={qrCodeData.code}
              title="Código de Conexão WhatsApp"
              description="Abra o WhatsApp no seu celular e escaneie este código"
              size={300}
              onRefresh={generateQRCode}
              isLoading={connectWhatsApp.isPending}
              showDownload={true}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como conectar:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Abra o WhatsApp no seu celular</p>
                      <p className="text-sm text-muted-foreground">
                        Certifique-se de que o WhatsApp está atualizado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Toque em Menu → WhatsApp Web</p>
                      <p className="text-sm text-muted-foreground">
                        Ou use o ícone de QR Code nas configurações
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Aponte a câmera para o QR Code</p>
                      <p className="text-sm text-muted-foreground">
                        Mantenha o celular estável para melhor leitura
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Aguarde a confirmação</p>
                      <p className="text-sm text-muted-foreground">
                        A conexão será estabelecida automaticamente
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {connectionStatus === "connected" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              WhatsApp conectado com sucesso! Redirecionando para a lista de agentes...
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Precisa de ajuda?</h3>
          <p className="text-sm text-muted-foreground">
            Se tiver problemas para conectar, verifique se o WhatsApp está atualizado 
            e tente novamente. O QR Code expira em 2 minutos.
          </p>
        </div>
      </div>
    </div>
  )
} 