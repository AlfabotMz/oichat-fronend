"use client"

import React, { useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

// Componente condicional para ReactQueryDevtools
function ReactQueryDevtoolsWrapper() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Ferramentas de desenvolvedor não devem ser incluídas no build de produção ou renderizadas no servidor
  if (process.env.NODE_ENV === 'production' || !isClient) {
    return null
  }

  // Import dinâmico apenas no client
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
