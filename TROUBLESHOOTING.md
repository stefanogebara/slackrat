# 🔧 Guia de Solução de Problemas - Bot de DM

## ❌ Problema: Bot não responde a comandos

### 🔍 Verificações Básicas

1. **Bot está rodando?**
   ```bash
   # Verifique se o processo está ativo
   npm run dm
   
   # Ou use o menu interativo
   node start.js
   # Escolha opção 6️⃣
   ```

2. **Configuração correta?**
   ```bash
   # Verifique as variáveis de ambiente
   cat .env
   
   # Deve ter:
   SLACK_BOT_TOKEN=xoxb-seu-token-aqui
   SLACK_SIGNING_SECRET=seu-signing-secret-aqui
   ```

3. **Event Subscriptions configurado?**
   - Acesse: https://api.slack.com/apps/SEU_APP_ID/event-subscriptions
   - Request URL deve apontar para: `http://localhost:3000/slack/events`
   - Bot Events devem incluir: `message.im`, `message.mpim`

### 🚨 Problemas Comuns

#### Bot não responde a "search"
**Sintoma:** Digite "search" na DM mas o bot não responde

**Solução:**
1. Verifique os logs do terminal onde o bot está rodando
2. Confirme se Event Subscriptions está ativo
3. **REINSTALE O APP** após mudanças nas configurações

#### Erro de assinatura
**Sintoma:** Erro "Invalid signature" nos logs

**Solução:**
1. Verifique se `SLACK_SIGNING_SECRET` está correto
2. Confirme se o Request URL está correto
3. Use ngrok para testar localmente

#### Bot não recebe eventos
**Sintoma:** Bot roda mas não processa mensagens

**Solução:**
1. Verifique se o app foi reinstalado após mudanças
2. Confirme se as permissões incluem `im:history`, `im:write`
3. Teste com o endpoint `/test` para verificar conectividade

### 🧪 Testes de Diagnóstico

#### 1. Teste de Conectividade
```bash
# Acesse no navegador
http://localhost:3000/test
http://localhost:3000/debug
http://localhost:3000/health
```

#### 2. Teste de Cenários
```bash
# Execute todos os cenários de teste
npm run test:scenarios

# Ou teste um comando específico
node src/test-dm-scenarios.js "search"
```

#### 3. Verificar Logs
```bash
# Inicie o bot com logs detalhados
npm run dm

# Procure por mensagens como:
# 📨 DM recebida de USER_ID: "search"
# ✅ Comando "search" detectado - enviando ajuda
```

### 🔧 Soluções Específicas

#### Para Windows
```bash
# Use PowerShell ou CMD
# Evite Git Bash para comandos npm

# Se houver problemas de permissão
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Para ngrok
```bash
# Instale ngrok
npm install -g ngrok

# Inicie o túnel
ngrok http 3000

# Use a URL HTTPS no Request URL do Slack
# Exemplo: https://abc123.ngrok.io/slack/events
```

#### Para Docker
```bash
# Construa e execute
docker-compose up --build

# Verifique logs
docker-compose logs -f slack-bot
```

### 📱 Verificações no Slack

1. **Bot está online?**
   - Verifique se aparece como "ativo" no Slack

2. **Permissões corretas?**
   - O bot deve ter acesso aos canais que você quer buscar

3. **App instalado?**
   - Vá em "Install App" e confirme a instalação

### 🆘 Se Nada Funcionar

1. **Reinicie tudo:**
   ```bash
   # Pare o bot (Ctrl+C)
   # Reinstale o app no Slack
   # Reinicie o bot
   npm run dm
   ```

2. **Verifique a documentação:**
   - `README.md` - Configuração básica
   - `DM_SETUP.md` - Configuração específica do DM
   - `SLACK_SETUP.md` - Configuração do Slack App

3. **Teste com exemplo mínimo:**
   ```bash
   # Use o script de teste básico
   node src/test-dm.js
   ```

### 📊 Logs Úteis

**Logs de sucesso:**
```
📨 DM recebida de USER_ID: "search"
✅ Comando "search" detectado - enviando ajuda
```

**Logs de erro:**
```
❌ Erro no endpoint de eventos: Invalid signature
❌ Erro ao enviar mensagem: channel_not_found
```

### 🎯 Checklist de Verificação

- [ ] Bot está rodando (`npm run dm`)
- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Event Subscriptions ativo no Slack
- [ ] Request URL correto
- [ ] Bot Events configurados (`message.im`, `message.mpim`)
- [ ] App reinstalado após mudanças
- [ ] Bot tem permissões necessárias
- [ ] Endpoint `/test` responde corretamente

### 💡 Dicas de Debug

1. **Use o menu interativo:**
   ```bash
   node start.js
   # Opção 6️⃣ para bot DM
   # Opção 7️⃣ para testar cenários
   ```

2. **Monitore logs em tempo real:**
   ```bash
   npm run dm:dev
   # Auto-reload com nodemon
   ```

3. **Teste incrementalmente:**
   - Primeiro: apenas "oi" ou "hello"
   - Depois: "search"
   - Por fim: "search #canal palavra"

4. **Verifique a rede:**
   - Firewall não bloqueando porta 3000
   - ngrok funcionando (se usando)
   - DNS resolvendo localhost

---

**🎯 Lembre-se:** O bot DEVE responder a qualquer mensagem na DM, mesmo que seja apenas "search" ou um comando desconhecido. Se não responder, há um problema de configuração ou conectividade.



