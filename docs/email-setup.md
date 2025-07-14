# Configuração de Email - Supabase

## 📧 Template de Confirmação de Email

### 1. Acesse o Dashboard do Supabase
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto

### 2. Configure o Template de Email
1. No menu lateral, vá para **Authentication** → **Email Templates**
2. Clique em **Confirm signup**
3. Configure o template com o conteúdo do arquivo `public/email-templates/confirm-email.html`

### 3. Configurações Importantes
- **Assunto:** "Confirme sua conta - OIChat"
- **URL de Redirecionamento:** `https://seu-dominio.com/auth/login`
- **Template HTML:** Use o arquivo `public/email-templates/confirm-email.html`

### 4. Variáveis Disponíveis
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Email }}` - Email do usuário

### 5. Teste o Template
1. Use "Test email" no Supabase
2. Registre um novo usuário
3. Verifique se o email foi enviado

## 🔧 Configuração SMTP (Opcional)
1. Vá para **Settings** → **Auth** → **SMTP Settings**
2. Configure seu provedor de email

## 📱 Fluxo Completo
1. Usuário se registra
2. Redirecionado para `/auth/confirm-email`
3. Recebe email personalizado
4. Clica no link de confirmação
5. Redirecionado para login
6. Acessa o dashboard 