"use client"

import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import { useState } from "react"

interface QRCodeProps {
  value: string
  title?: string
  description?: string
  size?: number
  onRefresh?: () => void
  isLoading?: boolean
  showDownload?: boolean
}

export function QRCode({
  value,
  title = "QR Code",
  description = "Escaneie este código para conectar",
  size = 256,
  onRefresh,
  isLoading = false,
  showDownload = true,
}: QRCodeProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!value) return

    setIsDownloading(true)
    try {
      // Criar um canvas temporário para gerar a imagem
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Criar um SVG temporário
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("width", size.toString())
      svg.setAttribute("height", size.toString())
      svg.setAttribute("viewBox", `0 0 ${size} ${size}`)

      // Adicionar o QR Code ao SVG
      const qrCode = document.createElementNS("http://www.w3.org/2000/svg", "g")
      const qrCodeSVG = new QRCodeSVG({ value, size })
      qrCode.innerHTML = qrCodeSVG.toString()
      svg.appendChild(qrCode)

      // Converter SVG para string
      const svgString = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)

      // Criar link de download
      const link = document.createElement("a")
      link.href = url
      link.download = "qrcode.svg"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpar URL
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao baixar QR Code:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative">
          {isLoading ? (
            <div
              className="bg-muted rounded-lg flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border">
              <QRCodeSVG
                value={value}
                size={size}
                level="M"
                includeMargin={true}
                style={{ display: "block" }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          )}
          
          {showDownload && value && !isLoading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Baixando..." : "Baixar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 