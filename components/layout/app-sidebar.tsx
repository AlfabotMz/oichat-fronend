"use client"

import { MessageSquare, BarChart3, Users, Send, Bot, FileText, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMockSession } from "@/hooks/use-mock-session"
import { useToast } from "@/hooks/use-toast"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Atendimentos",
    url: "/conversations",
    icon: MessageSquare,
  },
  {
    title: "Contatos",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Disparos",
    url: "/broadcasts",
    icon: Send,
  },
  {
    title: "Automação",
    url: "/agents",
    icon: Bot,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, signOut } = useMockSession()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    try {
      signOut()
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      })
      router.push("/auth/login")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive",
      })
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Sidebar variant="sidebar" className="border-r border-border/40">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="grid flex-1 text-left">
            <span className="text-lg font-bold text-foreground">OiChat</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="h-11 text-sm font-medium">
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{session?.user?.name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {session?.user?.plan || "FREE"}
                </Badge>
              </div>
              <Button variant="ghost" className="w-full justify-start h-9 text-sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
