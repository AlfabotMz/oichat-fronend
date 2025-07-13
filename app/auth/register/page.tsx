import { RegisterForm } from "@/components/auth/register-form"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <RegisterForm />
    </AuthGuard>
  )
}
