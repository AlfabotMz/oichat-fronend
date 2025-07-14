# Tarefas Pendentes

Esta é uma lista das tarefas pendentes e pontos que precisam de atenção no projeto:

## 1. Integração com a API de Backend (Crucial)
- **Fornecer documentação da API:** Para que as chamadas `fetch` reais possam ser implementadas, é necessário que você forneça a documentação detalhada dos endpoints para:
    - Criação de instância do WhatsApp.
    - Verificação de status da instância do WhatsApp.
    - Envio de mensagens para o agente de IA.

## 2. Depuração de Bugs no Frontend
- **Bug do chat desaparecendo:** Analisar os `console.log` adicionados em `components/chat/chat-interface.tsx` para identificar a causa do desaparecimento das mensagens.
- **Sidebar não clicável:** Investigar usando as ferramentas de desenvolvedor do navegador (z-index, elementos sobrepostos, erros no console) para entender por que a sidebar não responde a cliques.
- **Layout "bugado" na versão comprimida:** Descrever o comportamento exato e os elementos afetados para que o problema de CSS/responsividade possa ser diagnosticado e corrigido.

## 3. Testes
- Realizar testes completos de todas as funcionalidades após a integração da API de backend e a correção dos bugs.
