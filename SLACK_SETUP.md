# 🔧 Configuração Completa do Slack Search Agent

Este guia te levará passo a passo para configurar completamente o Slack Search Agent no seu workspace.

## 📋 Pré-requisitos

- ✅ Conta no Slack com permissões de administrador
- ✅ Acesso ao painel de desenvolvimento do Slack
- ✅ Node.js instalado no seu computador
- ✅ Projeto configurado e rodando localmente

## 🚀 Passo 1: Criar o App no Slack

### 1.1 Acessar o Painel de Desenvolvimento

1. Vá para [api.slack.com/apps](https://api.slack.com/apps)
2. Clique em **"Create New App"**
3. Selecione **"From scratch"**

### 1.2 Configurar Informações Básicas

- **App Name**: `SearchAgent` (ou o nome que preferir)
- **Pick a workspace**: Selecione seu workspace
- **App Description**: `Agente inteligente de busca para mensagens do Slack`

## 🔑 Passo 2: Configurar Permissões (OAuth & Permissions)

### 2.1 Adicionar Bot Token Scopes

No painel do app, vá em **"OAuth & Permissions"** e adicione estes escopos:

#### **Bot Token Scopes (Obrigatórios):**
- `channels:history` - Ler histórico de canais públicos
- `channels:read` - Listar canais
- `users:read` - Obter informações de usuários
- `chat:write` - Enviar mensagens no Slack

#### **Bot Token Scopes (Opcionais):**
- `groups:history` - Ler histórico de canais privados
- `im:history` - Ler histórico de DMs
- `mpim:history` - Ler histórico de grupos privados

### 2.2 Instalar App no Workspace

1. Clique em **"Install to Workspace"**
2. Autorize todas as permissões solicitadas
3. **IMPORTANTE**: Copie o **Bot User OAuth Token** (começa com `xoxb-`)

## ⚙️ Passo 3: Configurar Slash Commands

### 3.1 Criar Comando /search

1. No painel do app, vá em **"Slash Commands"**
2. Clique em **"Create New Command"**
3. Configure:

```
Command: /search
Request URL: https://seu-dominio.com/slack/commands
Short Description: Buscar mensagens em canais
Usage Hint: canal palavra-chave
```

### 3.2 Criar Comando /searchhelp

1. Clique em **"Create New Command"** novamente
2. Configure:

```
Command: /searchhelp
Request URL: https://seu-dominio.com/slack/commands
Short Description: Mostrar ajuda do Search Agent
Usage Hint: (sem parâmetros)
```

## 🔗 Passo 4: Configurar Event Subscriptions

### 4.1 Ativar Event Subscriptions

1. No painel do app, vá em **"Event Subscriptions"**
2. Clique em **"Enable Events"**

### 4.2 Configurar Request URL

Para desenvolvimento local, você precisará usar ngrok:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor sua porta local
ngrok http 3000
```

Use a URL do ngrok como **Request URL**: `https://abc123.ngrok.io/slack/events`

### 4.3 Adicionar Eventos

Clique em **"Subscribe to bot events"** e adicione:

- `app_mention` - Quando o bot for mencionado
- `message.channels` - Mensagens em canais públicos
- `message.groups` - Mensagens em canais privados (se necessário)

## 🌐 Passo 5: Configurar Interactivity & Shortcuts

### 5.1 Ativar Interactivity

1. No painel do app, vá em **"Interactivity & Shortcuts"**
2. Clique em **"Enable Interactivity"**
3. **Request URL**: `https://seu-dominio.com/slack/interactions`

### 5.2 Configurar Shortcuts

1. Clique em **"Create New Shortcut"**
2. Configure:

```
Name: Search Messages
Type: Message
Callback ID: search_messages
Description: Buscar mensagens por palavra-chave
```

## 🔐 Passo 6: Obter Credenciais

### 6.1 Copiar Credenciais

No painel do app, vá em **"Basic Information"** e copie:

- **Signing Secret** (começa com `x`)
- **Bot User OAuth Token** (começa com `xoxb-`)

### 6.2 Configurar .env

Edite seu arquivo `.env`:

```env
# Configurações do Slack
SLACK_BOT_TOKEN=xoxb-seu-token-aqui
SLACK_SIGNING_SECRET=seu-signing-secret-aqui

# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Canal padrão para testes
DEFAULT_CHANNEL=C1234567890
```

## 🧪 Passo 7: Testar Localmente

### 7.1 Instalar Dependências

```bash
npm install
```

### 7.2 Executar Testes

```bash
npm test
```

### 7.3 Iniciar Servidor

```bash
npm run dev
```

### 7.4 Testar com ngrok

```bash
ngrok http 3000
```

Use a URL do ngrok para atualizar as URLs no painel do Slack.

## 📱 Passo 8: Testar no Slack

### 8.1 Adicionar Bot aos Canais

Em cada canal onde você quer fazer buscas:

```
/invite @SearchAgent
```

### 8.2 Testar Comandos

```
/search geral deploy
/searchhelp
```

### 8.3 Testar Menções

```
@SearchAgent search bug
```

## 🔧 Passo 9: Configurações Avançadas

### 9.1 Configurar ngrok para Produção

Para desenvolvimento contínuo, configure ngrok com domínio fixo:

```bash
ngrok http 3000 --subdomain=seu-app
```

### 9.2 Configurar Variáveis de Ambiente

```env
# Para produção
NODE_ENV=production
SLACK_APP_ID=seu-app-id
SLACK_TEAM_ID=seu-team-id
```

### 9.3 Configurar Logs

```javascript
// Adicionar ao index.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚨 Troubleshooting

### Erro: "not_in_channel"
```
❌ Error: not_in_channel
💡 Solução: Adicione o bot ao canal usando /invite @SearchAgent
```

### Erro: "missing_scope"
```
❌ Error: missing_scope
💡 Solução: Verifique as permissões e reinstale o app
```

### Erro: "invalid_request"
```
❌ Error: invalid_request
💡 Solução: Verifique se as URLs estão corretas no painel
```

### Erro: "signature_verification_failed"
```
❌ Error: signature_verification_failed
💡 Solução: Verifique o SLACK_SIGNING_SECRET no .env
```

## 📊 Monitoramento

### 9.1 Verificar Logs

```bash
# Logs do servidor
tail -f combined.log

# Logs de erro
tail -f error.log
```

### 9.2 Verificar Status do App

No painel do Slack, vá em **"OAuth & Permissions"** e verifique:

- ✅ App instalado no workspace
- ✅ Permissões concedidas
- ✅ Token válido

### 9.3 Testar Endpoints

```bash
# Testar health check
curl http://localhost:3000/health

# Testar busca
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"channelId":"C1234567890","keyword":"teste"}'
```

## 🚀 Deploy para Produção

### 9.1 Configurar Servidor

- Use um servidor com HTTPS
- Configure domínio fixo
- Atualize URLs no painel do Slack
- Configure variáveis de ambiente

### 9.2 Usar PM2

```bash
npm install -g pm2
pm2 start src/index.js --name "slack-search-agent"
pm2 startup
pm2 save
```

## 🎯 Próximos Passos

1. ✅ **Configuração básica** - App criado e configurado
2. ✅ **Permissões** - Escopos configurados
3. ✅ **Slash Commands** - Comandos funcionando
4. ✅ **Event Subscriptions** - Webhooks configurados
5. ✅ **Testes** - Funcionalidades validadas
6. 🔄 **Deploy** - Configurar para produção
7. 📈 **Monitoramento** - Logs e métricas
8. 🚀 **Melhorias** - Novas funcionalidades

## 📞 Suporte

Se você encontrar problemas:

1. Verifique os logs do console
2. Execute `npm test` para validar
3. Verifique as configurações no painel do Slack
4. Consulte a documentação da API do Slack
5. Abra uma issue no repositório

---

**🎉 Parabéns! Seu Slack Search Agent está configurado e funcionando!**



