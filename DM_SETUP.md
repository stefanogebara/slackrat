# 💬 Bot de Direct Message (DM) - Guia de Configuração

Este guia explica como configurar e usar o bot de busca que funciona via Direct Message no Slack.

## 🎯 Por que usar o Bot de DM?

- ✅ **Não polui canais públicos** - Todas as interações são privadas
- ✅ **Comandos simples** - Use comandos diretos como `search #canal palavra`
- ✅ **Histórico pessoal** - Mantém histórico das suas buscas
- ✅ **Respostas organizadas** - Resultados formatados e fáceis de ler
- ✅ **Comandos especiais** - `help`, `history`, `stats`

## 🚀 Início Rápido

### 1. Iniciar o Bot

```bash
# Modo produção
npm run dm

# Modo desenvolvimento (com auto-reload)
npm run dm:dev

# Via script interativo
npm run setup
# Escolha opção 6: 💬 BOT DE DM
```

### 2. Testar a Conexão

```bash
npm run test:dm
```

Este comando irá:
- Verificar se o bot está funcionando
- Enviar uma mensagem de teste para você
- Mostrar instruções de uso

## ⚙️ Configuração do Slack App

### 1. Event Subscriptions

1. Acesse: https://api.slack.com/apps/SEU_APP_ID/event-subscriptions
2. Ative "Enable Events"
3. Configure a **Request URL**:
   - **Local**: `https://SEU_NGROK.ngrok.io/slack/events`
   - **Produção**: `https://seu-dominio.com/slack/events`

### 2. Bot Events

Adicione estes eventos:

- ✅ `message.im` - Receber mensagens diretas
- ✅ `message.mpim` - Receber mensagens em group DMs
- ✅ `app_mention` - Quando mencionarem o bot (opcional)

### 3. Permissões Necessárias

No **OAuth & Permissions**, adicione estes **Bot Token Scopes**:

- `channels:history` - Ler histórico de canais
- `channels:read` - Listar canais
- `users:read` - Obter informações de usuários
- `chat:write` - Enviar mensagens
- `im:history` - Ler histórico de DMs
- `im:write` - Enviar DMs
- `mpim:history` - Ler histórico de group DMs
- `mpim:write` - Enviar group DMs

### 4. Reinstalar o App

**IMPORTANTE**: Após mudar as permissões:

1. Vá em "Install App"
2. Clique em "Reinstall to Workspace"
3. Autorize novamente

## 🔍 Como Usar

### Comandos Básicos

Envie uma DM para o bot com:

```
search #canal palavra
```

**Exemplos:**
- `search #general teste`
- `search #random "hello world"`
- `search #deploy sucesso`

### Comandos Especiais

- `help` - Mostra todos os comandos disponíveis
- `history` - Mostra seu histórico de buscas
- `stats #canal` - Estatísticas do canal

### Formato das Respostas

O bot responde com:

1. **Confirmação** - "🔍 Buscando por 'palavra' no canal #canal..."
2. **Resumo** - Estatísticas e top usuários
3. **Mensagens** - Últimas mensagens encontradas com links

## 🧪 Teste Local com ngrok

### 1. Instalar ngrok

```bash
npm install -g ngrok
```

### 2. Iniciar o bot

```bash
npm run dm
```

### 3. Em outro terminal, executar ngrok

```bash
ngrok http 3000
```

### 4. Copiar a URL do ngrok

Exemplo: `https://abc123.ngrok.io`

### 5. Configurar no Slack

Use a URL do ngrok + `/slack/events`:
```
https://abc123.ngrok.io/slack/events
```

## 🐳 Deploy com Docker

### 1. Build da imagem

```bash
docker build -t slack-bot .
```

### 2. Executar com docker-compose

```bash
docker-compose up -d
```

### 3. Verificar logs

```bash
docker-compose logs -f slack-bot
```

## 🔧 Troubleshooting

### Erro: "not_in_channel"

```
❌ Error: Canal #canal não encontrado
💡 Solução: Verifique se o nome do canal está correto
```

### Erro: "missing_scope"

```
❌ Error: missing_scope
💡 Solução: Adicione as permissões necessárias e reinstale o app
```

### Bot não responde

1. ✅ Verifique se está rodando: `npm run dm`
2. ✅ Verifique a URL no Event Subscriptions
3. ✅ Verifique se reinstalou o app após mudanças
4. ✅ Use ngrok para testes locais

### Verificações

1. ✅ Bot está rodando na porta 3000?
2. ✅ Event Subscriptions configurado?
3. ✅ Bot Events adicionados?
4. ✅ App reinstalado no workspace?
5. ✅ URL do ngrok está correta?

## 📱 Exemplos de Uso

### Busca Simples

```
Você: search #general deploy
Bot: 🔍 Buscando por "deploy" no canal #general...
Bot: [Resultados da busca]
```

### Ver Histórico

```
Você: history
Bot: 📝 Suas últimas buscas:
1. deploy em #general (10/01/2024 14:30) - 5 resultados
2. bug em #random (09/01/2024 16:45) - 3 resultados
```

### Ajuda

```
Você: help
Bot: 🤖 Comandos disponíveis:
• search #canal palavra - Busca por palavra no canal
• history - Mostra seu histórico de buscas
• help - Esta mensagem de ajuda
```

## 🎉 Pronto!

Agora você tem um bot de busca que funciona via DM, mantendo os canais limpos e organizados!

Para dúvidas ou problemas, consulte:
- `README.md` - Documentação geral
- `SLACK_SETUP.md` - Configuração do Slack App
- `src/setup-events.js` - Instruções de eventos



