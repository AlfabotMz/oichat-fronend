import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TopNavbar } from "@/components/layout/top-navbar"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth={true}>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col w-full">
          <TopNavbar />
          <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
