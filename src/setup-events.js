const setupInstructions = `
📋 CONFIGURAÇÃO DO SLACK APP - EVENT SUBSCRIPTIONS

1. Acesse: https://api.slack.com/apps/SEU_APP_ID/event-subscriptions

2. Ative "Enable Events"

3. Request URL:
   - Para teste local com ngrok: https://SEU_NGROK.ngrok.io/slack/events
   - Para produção: https://seu-dominio.com/slack/events

4. Subscribe to Bot Events - Adicione:
   ✅ message.im - Receber mensagens diretas
   ✅ message.mpim - Receber mensagens em group DMs
   ✅ app_mention - Quando mencionarem o bot (opcional)

5. Save Changes

6. REINSTALE O APP:
   - Vá em "Install App"
   - Clique em "Reinstall to Workspace"
   - Autorize novamente

7. Para testar localmente:
   - Instale ngrok: npm install -g ngrok
   - Execute: ngrok http 3000
   - Use a URL do ngrok no Request URL

TESTE RÁPIDO:
1. Inicie o bot: node src/dm-bot.js
2. Abra o Slack
3. Envie DM para o bot: "search #general teste"
4. O bot deve responder com os resultados!
`;

console.log(setupInstructions);

