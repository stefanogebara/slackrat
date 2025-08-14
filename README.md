# 🤖 SlackRat - Bot de Busca para Slack

Um bot inteligente e confiável para buscar mensagens em canais do Slack, desenvolvido com o framework oficial `@slack/bolt`.

## ✨ Características

- 🔍 **Busca inteligente** em canais públicos e privados
- 📱 **Interface simples** via Direct Message
- 🚀 **Framework oficial** do Slack (@slack/bolt)
- ⚡ **Resposta rápida** e confiável
- 🎯 **Comandos intuitivos** e fáceis de usar

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/slackrat.git
cd slackrat
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
SLACK_BOT_TOKEN=xoxb-seu-token-aqui
SLACK_SIGNING_SECRET=seu-signing-secret-aqui
PORT=3000
NODE_ENV=development
```

### 4. Configure o Slack App

#### 4.1 Criar o App
1. Acesse [api.slack.com/apps](https://api.slack.com/apps)
2. Clique em "Create New App" → "From scratch"
3. Nome: `SlackRat`
4. Workspace: Selecione seu workspace

#### 4.2 Configurar Event Subscriptions
1. Vá em "Event Subscriptions"
2. Clique "Enable Events"
3. **Request URL**: `https://seu-ngrok.ngrok.io/slack/events`
4. **Subscribe to bot events**:
   - ✅ `message.im` - Mensagens diretas
   - ✅ `message.channels` - Canais públicos
   - ✅ `message.groups` - Canais privados

#### 4.3 Configurar Permissões (OAuth & Permissions)
**Bot Token Scopes:**
- `channels:history` - Ler histórico de canais
- `channels:read` - Listar canais
- `groups:history` - Ler histórico de canais privados
- `groups:read` - Listar canais privados
- `users:read` - Obter informações de usuários
- `chat:write` - Enviar mensagens
- `im:history` - Ler histórico de DMs
- `im:write` - Enviar DMs

#### 4.4 Reinstalar o App
1. Vá em "Install App"
2. Clique "Reinstall to Workspace"
3. Autorize novamente

### 5. Configurar ngrok (para desenvolvimento)
```bash
npm install -g ngrok
ngrok http 3000
```

Use a URL do ngrok no **Request URL** dos Event Subscriptions.

## 🎯 Como Usar

### Comandos Disponíveis

#### 🔍 Busca em Canal
```
search #canal palavra
search canal palavra
```

**Exemplos:**
- `search #general teste`
- `search slackrattest Round`
- `search #random "hello world"`

#### 📚 Ajuda
```
help
```

#### 👋 Boas-vindas
```
oi
hello
hi
olá
```

### Formato das Respostas

O bot retorna:
1. **Confirmação** - "🔍 Buscando por 'palavra' no canal #canal..."
2. **Resumo** - Estatísticas e top usuários
3. **Mensagens** - Últimas mensagens encontradas com links

## 🧪 Teste

### 1. Iniciar o bot
```bash
npm start
```

### 2. Testar no Slack
1. Envie uma DM para o bot: `oi`
2. Teste a busca: `search #slackrattest Round`
3. Veja a ajuda: `help`

## 📁 Estrutura do Projeto

```
slackrat/
├── src/
│   └── bot.js          # Bot principal
├── .env                 # Configurações
├── package.json         # Dependências
└── README.md           # Este arquivo
```

## 🔧 Desenvolvimento

### Modo desenvolvimento (com auto-reload)
```bash
npm run dev
```

### Testes
```bash
npm test
```

## 🐳 Docker (Opcional)

```bash
docker build -t slackrat .
docker run -p 3000:3000 --env-file .env slackrat
```

## 📋 Requisitos

- Node.js 16+
- npm ou yarn
- Conta no Slack com permissões de administrador
- ngrok (para desenvolvimento local)

## 🚨 Solução de Problemas

### Bot não responde
1. Verifique se os Event Subscriptions estão configurados
2. Confirme se o ngrok está rodando
3. Verifique se as permissões estão corretas
4. Reinstale o app no workspace

### Erro de permissões
1. Verifique se todos os Bot Token Scopes estão adicionados
2. Reinstale o app no workspace
3. Confirme se o bot foi adicionado aos canais

### Canal não encontrado
1. Verifique se o nome do canal está correto
2. Confirme se o bot tem acesso ao canal
3. Verifique se as permissões `groups:read` e `groups:history` estão ativas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [Slack Bolt Framework](https://slack.dev/bolt-js/)
- [Slack API](https://api.slack.com/)

---

**Desenvolvido com ❤️ por Stefa**
