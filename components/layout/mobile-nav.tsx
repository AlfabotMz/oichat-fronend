"use client"

import { useState } from "react"
import { Menu, MessageSquare } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "./app-sidebar"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-between p-4 border-b border-border/40 md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MessageSquare className="h-4 w-4" />
        </div>
        <span className="font-semibold">OiChat</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <AppSidebar />
        </SheetContent>
      </Sheet>
    </div>
  )
}
