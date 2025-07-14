# Configuração WhatsApp - Supabase

## 📱 Tabela de Conexões WhatsApp

### 1. Criar Tabela no Supabase

Execute o seguinte SQL no SQL Editor do Supabase:

```sql
-- Tabela de conexões WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    instance_name TEXT NOT NULL,
    connection_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONNECTED', 'DISCONNECTED', 'ERROR')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT whatsapp_connections_pkey PRIMARY KEY (id),
    CONSTRAINT whatsapp_connections_instance_name_key UNIQUE (instance_name),
    CONSTRAINT whatsapp_connections_connection_code_key UNIQUE (connection_code)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_user_id ON public.whatsapp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_agent_id ON public.whatsapp_connections(agent_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_status ON public.whatsapp_connections(status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_connections_updated_at 
    BEFORE UPDATE ON public.whatsapp_connections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias conexões
CREATE POLICY "Users can view their own whatsapp connections" ON public.whatsapp_connections
    FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários inserirem suas próprias conexões
CREATE POLICY "Users can insert their own whatsapp connections" ON public.whatsapp_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias conexões
CREATE POLICY "Users can update their own whatsapp connections" ON public.whatsapp_connections
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias conexões
CREATE POLICY "Users can delete their own whatsapp connections" ON public.whatsapp_connections
    FOR DELETE USING (auth.uid() = user_id);
```

### 2. Estrutura da Tabela

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único da conexão |
| `user_id` | UUID | ID do usuário (referência para users) |
| `agent_id` | UUID | ID do agente (referência para agents) |
| `instance_name` | TEXT | Nome único da instância |
| `connection_code` | TEXT | Código único de conexão |
| `status` | TEXT | Status da conexão (PENDING, CONNECTED, DISCONNECTED, ERROR) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

### 3. Fluxo de Conexão

1. **Usuário acessa** `/agents/[id]/connect`
2. **Sistema verifica** se o agente está ativo
3. **API gera** código único de conexão
4. **QR Code é exibido** para o usuário
5. **Usuário escaneia** com WhatsApp
6. **Sistema verifica** status a cada 5 segundos
7. **Conexão é confirmada** automaticamente

### 4. APIs Implementadas

#### Gerar Código de Conexão
```
POST /api/whatsapp/generate-code/[agentId]
```

#### Verificar Status
```
GET /api/whatsapp/status/[instance]
```

### 5. Integração Real (Futuro)

Para integrar com WhatsApp real, você precisará:

1. **API WhatsApp Business** ou similar
2. **Webhook** para receber status
3. **Autenticação** com token
4. **Gestão de sessões** WhatsApp

### 6. Teste da Funcionalidade

1. **Crie um agente** e ative-o
2. **Acesse** a página de conexão
3. **Verifique** se o QR Code aparece
4. **Teste** o polling de status
5. **Verifique** se a conexão é salva no banco

### 7. Troubleshooting

#### QR Code não aparece:
- Verifique se o agente está ativo
- Verifique logs da API
- Teste a rota diretamente

#### Status não atualiza:
- Verifique se a tabela foi criada
- Verifique políticas RLS
- Teste o polling manualmente

#### Erro de conexão:
- Verifique se o usuário tem plano PRO
- Verifique se o agente pertence ao usuário
- Verifique logs do Supabase 