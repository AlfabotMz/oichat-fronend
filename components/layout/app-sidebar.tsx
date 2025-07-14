"use client"

import { BarChart3, Bot, ChevronLeft, LogOut, MessageSquare, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

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
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Atendents",
    url: "/agents",
    icon: Bot,
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
  const { toast } = useToast()
  const { setOpenMobile } = useSidebar()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          setUser(session.user)
        }
      } catch (error) {
        console.error("Error fetching user session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [supabase.auth])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      })
      router.refresh()
      router.push("/auth/login")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer o logout. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <Sidebar
      variant="sidebar"
      className={cn(
        "bg-gray-900 text-gray-200 border-r border-gray-800",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="grid flex-1 text-left">
              <span className="text-lg font-bold text-white">OiChat</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url} onClick={() => setOpenMobile(false)}>
                    <SidebarMenuButton
                      isActive={pathname === item.url}
                      className={cn(
                        "h-11 text-sm font-medium hover:bg-gray-700 hover:text-white",
                        isCollapsed ? "justify-center" : "justify-start"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            {!isCollapsed && !isLoading && (
              <div className="px-4 py-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {user?.user_metadata?.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {/* TODO: Get plan from user metadata */}
                    PRO
                  </Badge>
                </div>
              </div>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start h-11 text-sm hover:bg-gray-700 hover:text-white"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && "Sair"}
            </SidebarMenuButton>
          </SidebarMenuItem>
          
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
