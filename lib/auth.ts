import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: ":memory:", // Para desenvolvimento no v0
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      plan: {
        type: "string",
        defaultValue: "FREE",
        required: false,
      },
      planStart: {
        type: "date",
        required: false,
      },
      planEnd: {
        type: "date",
        required: false,
      },
      remoteJid: {
        type: "string",
        required: false,
      },
    },
  },
  trustedOrigins: ["http://localhost:3000", "https://v0.dev", "https://*.v0.dev"],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User
