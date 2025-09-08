import "better-auth"

declare module "better-auth" {
  interface User {
    plan?: "FREE" | "PRO"
    planStart?: Date | null
    planEnd?: Date | null
    remoteJid?: string | null
  }
}
