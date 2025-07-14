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