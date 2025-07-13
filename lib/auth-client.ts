import { createAuthClient } from "better-auth/react"

// Função para obter a URL base correta
function getBaseURL() {
  if (typeof window !== "undefined") {
    // No cliente, usar a origem atual
    return window.location.origin
  }

  // No servidor, usar uma URL padrão para desenvolvimento
  return process.env.BETTER_AUTH_URL || "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})

export const { signIn, signUp, signOut, useSession } = authClient
