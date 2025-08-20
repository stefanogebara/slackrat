# 🚀 Deploy do SlackRat no Railway

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Conta no Railway (gratuita)
- ✅ Slack App configurado com permissões
- ✅ Node.js instalado localmente

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Commit das mudanças
```bash
git add .
git commit -m "feat: prepare for Railway deployment"
git push origin master
```

### 1.2 Verificar arquivos de deploy
- ✅ `railway.json` - Configuração do Railway
- ✅ `package.json` - Scripts e dependências
- ✅ `src/dm-bot.js` - Bot principal com endpoints

## 🚀 Passo 2: Deploy no Railway

### 2.1 Acessar Railway
- Vá para: [railway.app](https://railway.app)
- Faça login com sua conta GitHub

### 2.2 Criar novo projeto
1. **Clique em "New Project"**
2. **Selecione "Deploy from GitHub repo"**
3. **Escolha seu repositório**: `stefanogebara/slackrat`
4. **Clique em "Deploy"**

### 2.3 Configurar variáveis de ambiente
No projeto Railway, vá em **"Variables"** e adicione:

```bash
SLACK_BOT_TOKEN=xoxb-20895847856-9345324993462-Lb06OhxQDH2ghHMHD3X0PYtw
SLACK_SIGNING_SECRET=188271062c9d33ffc83859de8d19d041
NODE_ENV=production
PORT=3000
```

### 2.4 Configurar domínio
1. **Vá em "Settings"** → **"Domains"**
2. **Clique em "Generate Domain"**
3. **Copie a URL** (ex: `https://slackrat-production.up.railway.app`)

## 🔗 Passo 3: Atualizar Slack App

### 3.1 Event Subscriptions
- Acesse: https://api.slack.com/apps
- Selecione seu app
- **Event Subscriptions** → **Request URL**
- **Mude para**: `https://slackrat-production.up.railway.app/slack/events`
- **Salve as mudanças**

### 3.2 Reinstalar App
- **OAuth & Permissions** → **Reinstall App**
- Confirme a reinstalação

## 🧪 Passo 4: Testar em Produção

### 4.1 Verificar deploy
- No Railway, vá em **"Deployments"**
- Deve mostrar **"Deploy Successful"**

### 4.2 Testar endpoints
- **Health check**: `https://slackrat-production.up.railway.app/health`
- **Debug info**: `https://slackrat-production.up.railway.app/debug`
- **Bot test**: `https://slackrat-production.up.railway.app/test`

### 4.3 Testar DM
- Envie DM para @slack_rat: `search slackrattest round`
- Deve funcionar igual ao local

## 📱 Passo 5: Adicionar Bot aos Canais

### 5.1 Método via Admin
- Peça para um admin adicionar @slack_rat nos canais desejados
- Ou use o método de configuração do canal

### 5.2 Canais recomendados para adicionar:
- `#general` - Canal principal
- `#dealflow` - Oportunidades de investimento
- `#portfolio` - Atualizações de portfólio
- `#business_update` - Atualizações de negócios
- `#fund-updates` - Atualizações de fundos

## 🔧 Comandos Úteis do Railway

### Via Dashboard:
- **"Deployments"** - Ver histórico de deploys
- **"Variables"** - Gerenciar variáveis de ambiente
- **"Settings"** - Configurar domínio e outras opções
- **"Logs"** - Ver logs em tempo real

### Via CLI (opcional):
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ver projetos
railway projects

# Ver logs
railway logs

# Abrir projeto
railway open
```

## 🚨 Troubleshooting

### Erro: "Build failed"
- Verificar se `package.json` está correto
- Verificar se `railway.json` está válido
- Verificar logs do build

### Erro: "App crashed"
- Verificar variáveis de ambiente
- Verificar logs da aplicação
- Verificar se o endpoint `/health` responde

### Bot não responde
- Verificar Event Subscriptions no Slack
- Verificar se a URL está correta
- Verificar logs no Railway

## 🎯 Vantagens do Railway

✅ **Deploy automático** - Cada push no GitHub faz deploy
✅ **Domínio HTTPS** - Automático e gratuito
✅ **Logs em tempo real** - Fácil debugging
✅ **Variáveis de ambiente** - Interface amigável
✅ **Escalabilidade** - Plano gratuito generoso
✅ **Integração GitHub** - Deploy contínuo

## 🎯 Resultado Final

✅ **Bot rodando 24/7** no Railway
✅ **Acessível para todos** no workspace
✅ **Sem dependência** de ngrok ou localhost
✅ **Deploy automático** a cada mudança
✅ **Logs centralizados** no Railway
✅ **Escalável** conforme necessário

## 📞 Suporte

Se houver problemas:
1. Verificar logs no Railway Dashboard
2. Verificar configuração do Slack App
3. Verificar variáveis de ambiente no Railway
4. Testar endpoints de health check

---

**🎉 Parabéns! Seu bot está em produção no Railway e todo mundo pode usar!**
