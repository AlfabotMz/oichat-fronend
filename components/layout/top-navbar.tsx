"use client"

import { MobileNav } from "./mobile-nav"
import { ArrowLeft, ArrowRight, RotateCcw, Download, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export function TopNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getPageTitle = () => {
    if (!mounted) return ""
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 0) return "dashboard"
    return segments[segments.length - 1]
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="hidden md:flex items-center gap-2">
        
        
      </div>
      <div className="flex items-center gap-2">
        <MobileNav />
      </div>
    </div>
  )
}
