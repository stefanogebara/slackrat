const { App } = require('@slack/bolt');
require('dotenv').config();

// Inicializar o app do Slack
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: process.env.PORT || 3000
});



// Comando de busca principal
app.message(/^search\s+(.+?)\s+(.+)$/i, async ({ message, say, client }) => {
  try {
    const [, channelPart, keyword] = message.text.match(/^search\s+(.+?)\s+(.+)$/i);
    
    // Limpar o nome do canal (remover formatação do Slack)
    let channelName = channelPart;
    
    // Se for formato <#ID|nome>, extrair o nome
    if (channelPart.includes('|')) {
      const match = channelPart.match(/<#([A-Z0-9]+)\|([^>]+)>/);
      if (match) {
        channelName = match[2]; // Usar o nome, não o ID
      }
    }
    
    // Remover # se existir
    channelName = channelName.replace(/^#/, '');
    
    console.log(`🔍 Busca solicitada: canal="${channelName}", palavra="${keyword}"`);
    
    // Responder imediatamente
    await say(`🔍 Buscando por "${keyword}" no canal #${channelName}...`);
    
    // Buscar o canal
    const channels = await client.conversations.list({
      types: 'public_channel,private_channel'
    });
    
    const channel = channels.channels.find(c => c.name === channelName);
    
    if (!channel) {
      await say(`❌ Canal #${channelName} não encontrado. Verifique o nome do canal.`);
      return;
    }
    
    console.log(`✅ Canal encontrado: ${channel.name} (ID: ${channel.id})`);
    
    // Buscar histórico do canal
    const result = await client.conversations.history({
      channel: channel.id,
      limit: 100
    });
    
    if (!result.messages || result.messages.length === 0) {
      await say(`🔍 Nenhuma mensagem encontrada no canal #${channelName}.`);
      return;
    }
    
    // Filtrar mensagens por palavra-chave
    const keywordLower = keyword.toLowerCase();
    const filteredMessages = result.messages.filter(msg => 
      msg.text && msg.text.toLowerCase().includes(keywordLower)
    );
    
    if (filteredMessages.length === 0) {
      await say(`🔍 Nenhuma mensagem encontrada com "${keyword}" no canal #${channelName}.`);
      return;
    }
    
    // Processar mensagens encontradas
    const processedMessages = await Promise.all(
      filteredMessages.slice(0, 5).map(async (msg) => {
        try {
          let userName = 'Usuário desconhecido';
          if (msg.user) {
            try {
              const userInfo = await client.users.info({ user: msg.user });
              userName = userInfo.user.real_name || userInfo.user.name;
            } catch (error) {
              console.log('Erro ao obter info do usuário:', error.message);
            }
          }
          
          let permalink = '';
          try {
            const permalinkResult = await client.chat.getPermalink({
              channel: channel.id,
              message_ts: msg.ts
            });
            permalink = permalinkResult.permalink;
          } catch (error) {
            console.log('Erro ao obter permalink:', error.message);
          }
          
          return {
            text: msg.text,
            user: userName,
            timestamp: new Date(parseFloat(msg.ts) * 1000).toLocaleString('pt-BR'),
            permalink
          };
        } catch (error) {
          console.log('Erro ao processar mensagem:', error.message);
          return null;
        }
      })
    );
    
    const validMessages = processedMessages.filter(msg => msg !== null);
    
    // Gerar resumo
    let summary = `🔍 *Busca por "${keyword}" no canal #${channelName}*\n`;
    summary += `📊 *${validMessages.length} mensagens encontradas*\n\n`;
    
    // Agrupar por usuário
    const userCounts = {};
    validMessages.forEach(msg => {
      userCounts[msg.user] = (userCounts[msg.user] || 0) + 1;
    });
    
    // Top usuários
    const topUsers = Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    summary += `👥 *Top usuários:*\n`;
    topUsers.forEach(([user, count]) => {
      summary += `• ${user}: ${count} mensagens\n`;
    });
    
    summary += `\n📝 *Mensagens encontradas:*\n`;
    
    validMessages.forEach((msg, index) => {
      const text = msg.text.length > 100 ? msg.text.substring(0, 100) + '...' : msg.text;
      summary += `${index + 1}. *${msg.user}* (${msg.timestamp}): ${text}\n`;
      if (msg.permalink) {
        summary += `   🔗 <${msg.permalink}|Ver mensagem>\n`;
      }
      summary += '\n';
    });
    
    if (filteredMessages.length > 5) {
      summary += `... e mais ${filteredMessages.length - 5} mensagens.\n`;
    }
    
    await say(summary);
    
  } catch (error) {
    console.error('Erro na busca:', error);
    await say(`❌ Erro na busca: ${error.message}`);
  }
});

// Comando de ajuda
app.message(/^help$/i, async ({ message, say }) => {
  await say(`🤖 *SlackRat - Bot de Busca*\n\n` +
    `🔍 *Comandos disponíveis:*\n` +
    `• \`search #canal palavra\` - Buscar por palavra no canal\n` +
    `• \`help\` - Esta mensagem de ajuda\n\n` +
    `📝 *Exemplos:*\n` +
    `• \`search #general teste\`\n` +
    `• \`search slackrattest Round\`\n\n` +
    `💡 *Dicas:*\n` +
    `• Use o nome do canal (com ou sem #)\n` +
    `• O bot busca em canais públicos e privados\n` +
    `• Resultados limitados a 5 mensagens para melhor visualização`);
});

// Mensagem de boas-vindas
app.message(/^(oi|hello|hi|olá)$/i, async ({ message, say }) => {
  await say(`👋 *Olá! Sou o SlackRat, seu bot de busca!*\n\n` +
    `🔍 *Como usar:*\n` +
    `• \`search #canal palavra\` - Buscar em um canal\n` +
    `• \`help\` - Ver todos os comandos\n\n` +
    `📝 *Exemplo rápido:*\n` +
    `\`search #slackrattest Round\`\n\n` +
    `Digite \`help\` para começar!`);
});

// Comando de busca sem parâmetros
app.message(/^search$/i, async ({ message, say }) => {
  await say(`🔍 *Comando de Busca*\n\n` +
    `Para buscar em um canal, use:\n` +
    `\`search #canal palavra\`\n\n` +
    `*Exemplos:*\n` +
    `• \`search #general teste\`\n` +
    `• \`search slackrattest Round\`\n\n` +
    `Digite \`help\` para ver todos os comandos disponíveis.`);
});

// Tratamento de comandos não reconhecidos
app.message(/^search\s+/i, async ({ message, say }) => {
  await say(`❓ *Formato incorreto*\n\n` +
    `O comando deve ser:\n` +
    `\`search #canal palavra\`\n\n` +
    `*Exemplos:*\n` +
    `• \`search #general teste\`\n` +
    `• \`search slackrattest Round\`\n\n` +
    `Digite \`help\` para ver todos os comandos.`);
});

// Comando não reconhecido
app.message(/^(?!search|help|oi|hello|hi|olá).*$/i, async ({ message, say }) => {
  await say(`❓ Comando não reconhecido. Digite \`help\` para ver os comandos disponíveis.`);
});

// Iniciar o app
(async () => {
  await app.start();
  console.log('🤖 SlackRat iniciado com sucesso!');
  console.log(`📱 Bot rodando na porta ${process.env.PORT || 3000}`);
  console.log('🔍 Comandos disponíveis: search #canal palavra, help');
})();
