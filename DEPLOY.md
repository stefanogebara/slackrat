# 🚀 Deploy do SlackRat para Produção

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Conta no Heroku (gratuita)
- ✅ Slack App configurado com permissões
- ✅ Node.js instalado localmente

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Commit das mudanças
```bash
git add .
git commit -m "feat: prepare for production deployment"
git push origin master
```

### 1.2 Verificar arquivos de deploy
- ✅ `Procfile` - Configuração do Heroku
- ✅ `package.json` - Scripts e dependências
- ✅ `app.json` - Configuração da aplicação

## 🚀 Passo 2: Deploy no Heroku

### 2.1 Instalar Heroku CLI
```bash
# Windows (PowerShell como admin)
winget install --id=Heroku.HerokuCLI

# Ou baixar de: https://devcenter.heroku.com/articles/heroku-cli
```

### 2.2 Login no Heroku
```bash
heroku login
```

### 2.3 Criar app no Heroku
```bash
heroku create slackrat-bot
```

### 2.4 Configurar variáveis de ambiente
```bash
heroku config:set SLACK_BOT_TOKEN=xoxb-20895847856-9345324993462-Lb06OhxQDH2ghHMHD3X0PYtw
heroku config:set SLACK_SIGNING_SECRET=188271062c9d33ffc83859de8d19d041
heroku config:set NODE_ENV=production
```

### 2.5 Deploy
```bash
git push heroku master
```

### 2.6 Verificar status
```bash
heroku logs --tail
```

## 🔗 Passo 3: Atualizar Slack App

### 3.1 Event Subscriptions
- Acesse: https://api.slack.com/apps
- Selecione seu app
- **Event Subscriptions** → **Request URL**
- **Mude para**: `https://slackrat-bot.herokuapp.com/slack/events`
- **Salve as mudanças**

### 3.2 Reinstalar App
- **OAuth & Permissions** → **Reinstall App**
- Confirme a reinstalação

## 🧪 Passo 4: Testar em Produção

### 4.1 Testar DM
- Envie DM para @slack_rat: `search slackrattest round`
- Deve funcionar igual ao local

### 4.2 Verificar logs
```bash
heroku logs --tail
```

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

## 🔧 Comandos Úteis do Heroku

```bash
# Ver logs em tempo real
heroku logs --tail

# Reiniciar app
heroku restart

# Ver variáveis de ambiente
heroku config

# Abrir app no navegador
heroku open

# Acessar console do app
heroku run node
```

## 🚨 Troubleshooting

### Erro: "App crashed"
```bash
heroku logs --tail
# Verificar se as variáveis de ambiente estão corretas
```

### Erro: "Request timeout"
- Verificar se o bot está respondendo
- Verificar logs do Heroku

### Bot não responde
- Verificar Event Subscriptions no Slack
- Verificar se a URL está correta
- Verificar logs do Heroku

## 🎯 Resultado Final

✅ **Bot rodando 24/7** no Heroku
✅ **Acessível para todos** no workspace
✅ **Sem dependência** de ngrok ou localhost
✅ **Logs centralizados** no Heroku
✅ **Escalável** conforme necessário

## 📞 Suporte

Se houver problemas:
1. Verificar logs: `heroku logs --tail`
2. Verificar configuração do Slack App
3. Verificar variáveis de ambiente no Heroku
4. Testar endpoint: `https://slackrat-bot.herokuapp.com/health`

---

**🎉 Parabéns! Seu bot está em produção e todo mundo pode usar!**
