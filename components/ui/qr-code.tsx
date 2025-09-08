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

  const handleDownload = () => {
    setIsDownloading(true)
    try {
      const svgElement = document.getElementById("qr-code-svg")
      if (!svgElement) {
        console.error("QR Code SVG element not found")
        setIsDownloading(false)
        return
      }

      const svgString = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = "qrcode.svg"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

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
              {value.startsWith("data:image/") ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img id="qr-code-svg" src={value} alt="QR Code" style={{ width: size, height: size, display: "block" }} />
                </>
              ) : (
                <QRCodeSVG
                  id="qr-code-svg"
                  value={value}
                  size={size}
                  level="M"
                  includeMargin={true}
                  style={{ display: "block" }}
                />
              )}
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