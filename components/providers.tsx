"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from "react"

// Componente condicional para ReactQueryDevtools
function ReactQueryDevtoolsWrapper() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  // Import dinâmico apenas no cliente
  const ReactQueryDevtools = React.lazy(() => 
    import("@tanstack/react-query-devtools").then(module => ({
      default: module.ReactQueryDevtools
    }))
  )

  return (
    <React.Suspense fallback={null}>
      <ReactQueryDevtools initialIsOpen={false} />
    </React.Suspense>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        {children}
        <Toaster />
      </ThemeProvider>
      <ReactQueryDevtoolsWrapper />
    </QueryClientProvider>
  )
}
