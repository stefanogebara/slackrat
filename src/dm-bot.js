require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { WebClient } = require('@slack/web-api');
const DMSearchBot = require('./utils-dm');

const app = express();
const port = process.env.PORT || 3000;

// Slack client
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const dmBot = new DMSearchBot(process.env.SLACK_BOT_TOKEN);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verificação de assinatura do Slack
function verifySlackSignature(req, res, next) {
    const signature = req.headers['x-slack-signature'];
    const timestamp = req.headers['x-slack-request-timestamp'];
    const body = req.body;
    
    if (!signature || !timestamp || !process.env.SLACK_SIGNING_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const baseString = `v0:${timestamp}:${JSON.stringify(body)}`;
    const expectedSignature = 'v0=' + crypto
        .createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
        .update(baseString)
        .digest('hex');
    
    if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
}

// Função principal de busca no canal
async function searchChannelHistory(channelName, keyword) {
    try {
        // Encontrar o canal pelo nome (incluindo canais privados)
        // CORREÇÃO: Buscar canais públicos e privados separadamente devido a limitação da API
        let allChannels = [];
        
        try {
            // Buscar canais públicos
            const publicChannels = await slackClient.conversations.list({
                types: 'public_channel',
                exclude_archived: true
            });
            allChannels = allChannels.concat(publicChannels.channels);
            console.log(`   Canais públicos encontrados: ${publicChannels.channels.length}`);
        } catch (error) {
            console.log(`   Erro ao buscar canais públicos: ${error.message}`);
        }
        
        try {
            // Buscar canais privados
            const privateChannels = await slackClient.conversations.list({
                types: 'private_channel',
                exclude_archived: true
            });
            allChannels = allChannels.concat(privateChannels.channels);
            console.log(`   Canais privados encontrados: ${privateChannels.channels.length}`);
        } catch (error) {
            console.log(`   Erro ao buscar canais privados: ${error.message}`);
        }
        
        console.log(`   Total de canais para busca: ${allChannels.length}`);
        
        const channel = allChannels.find(c => c.name === channelName);
        
        if (!channel) {
            throw new Error(`Canal #${channelName} não encontrado`);
        }
        
        // Verificar se o bot está no canal
        try {
            await slackClient.conversations.join({ channel: channel.id });
        } catch (joinError) {
            if (joinError.message !== 'already_in_channel') {
                console.log(`Bot não conseguiu entrar no canal #${channelName}:`, joinError.message);
            }
        }
        
        // Buscar histórico do canal
        const result = await slackClient.conversations.history({
            channel: channel.id,
            limit: 100
        });
        
        if (!result.messages || result.messages.length === 0) {
            return [];
        }
        
        // Filtrar mensagens por palavra-chave
        const keywordLower = keyword.toLowerCase();
        const filteredMessages = result.messages.filter(msg => {
            if (!msg.text) return false;
            return msg.text.toLowerCase().includes(keywordLower);
        });
        
        // Processar mensagens encontradas
        const processedMessages = await Promise.all(
            filteredMessages.map(async (msg) => {
                try {
                    // Obter informações do usuário
                    let userName = 'Usuário desconhecido';
                    if (msg.user) {
                        try {
                            const userInfo = await slackClient.users.info({ user: msg.user });
                            userName = userInfo.user.real_name || userInfo.user.name;
                        } catch (userError) {
                            console.log('Erro ao obter info do usuário:', userError.message);
                        }
                    }
                    
                    // Obter permalink da mensagem
                    let permalink = '';
                    try {
                        const permalinkResult = await slackClient.chat.getPermalink({
                            channel: channel.id,
                            message_ts: msg.ts
                        });
                        permalink = permalinkResult.permalink;
                    } catch (permalinkError) {
                        console.log('Erro ao obter permalink:', permalinkError.message);
                    }
                    
                    return {
                        text: msg.text,
                        user: userName,
                        timestamp: new Date(parseFloat(msg.ts) * 1000).toLocaleString('pt-BR'),
                        permalink,
                        thread_ts: msg.thread_ts || null
                    };
                } catch (error) {
                    console.log('Erro ao processar mensagem:', error.message);
                    return null;
                }
            })
        );
        
        return processedMessages.filter(msg => msg !== null);
        
    } catch (error) {
        console.error('Erro na busca:', error);
        throw error;
    }
}

// Função para gerar resumo dos resultados
function generateSummary(messages, keyword, channelName) {
    if (messages.length === 0) {
        return `🔍 *Busca por "${keyword}" no canal #${channelName}*\n\n❌ Nenhuma mensagem encontrada.`;
    }
    
    let summary = `🔍 *Busca por "${keyword}" no canal #${channelName}*\n`;
    summary += `📊 *${messages.length} mensagens encontradas*\n\n`;
    
    // Agrupar por usuário
    const userCounts = {};
    messages.forEach(msg => {
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
    
    summary += `\n📝 *Últimas mensagens:*\n`;
    
    // Mostrar as últimas 5 mensagens
    messages.slice(0, 5).forEach((msg, index) => {
        const text = msg.text.length > 100 ? msg.text.substring(0, 100) + '...' : msg.text;
        summary += `${index + 1}. *${msg.user}* (${msg.timestamp}): ${text}\n`;
        if (msg.permalink) {
            summary += `   🔗 <${msg.permalink}|Ver mensagem>\n`;
        }
        summary += '\n';
    });
    
    if (messages.length > 5) {
        summary += `... e mais ${messages.length - 5} mensagens.\n`;
    }
    
    return summary;
}

// Endpoint para eventos do Slack
app.post('/slack/events', verifySlackSignature, async (req, res) => {
    try {
        const { type, event } = req.body;
        
        // Responder ao challenge do Slack
        if (type === 'url_verification') {
            return res.json({ challenge: req.body.challenge });
        }
        
        // Processar eventos
        if (type === 'event_callback' && event) {
            // Eventos de DM
            if (event.type === 'message' && event.channel_type === 'im') {
                const { text, user, channel } = event;
                
                if (!text || user === 'USLACKBOT') {
                    return res.status(200).send('OK');
                }
                
                console.log(`📨 DM recebida de ${user}: "${text}"`);
                console.log(`🔍 Processando comando: "${text}"`);
                
                // Verificar se é um comando especial
                const specialResponse = await dmBot.handleSpecialCommands(text, user);
                if (specialResponse) {
                    await slackClient.chat.postMessage({
                        channel,
                        text: specialResponse
                    });
                    return res.status(200).send('OK');
                }
                
                // Verificar se é a primeira mensagem do usuário (welcome)
                if (text.toLowerCase().trim() === 'oi' || text.toLowerCase().trim() === 'hello' || text.toLowerCase().trim() === 'hi' || text.toLowerCase().trim() === 'olá') {
                    await slackClient.chat.postMessage({
                        channel,
                        text: `👋 *Olá! Sou o Bot de Busca do Slack!*\n\n🔍 *Como usar:*\n• \`search #canal palavra\` - Buscar em um canal\n• \`help\` - Ver todos os comandos\n• \`history\` - Seu histórico de buscas\n\n*Exemplo rápido:*\n\`search #general teste\`\n\nDigite \`search\` para começar!`
                    });
                    return res.status(200).send('OK');
                }
                
                // Verificar se é um comando de busca
                const searchMatch = text.match(/^search\s+(.+?)\s+(.+)$/i);
                if (searchMatch) {
                    let [, channelPart, keyword] = searchMatch;
                    
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
                    
                    console.log(`🔍 Processando busca: canal="${channelName}", palavra="${keyword}"`);
                    
                    // Responder imediatamente
                    await slackClient.chat.postMessage({
                        channel,
                        text: `🔍 Buscando por "${keyword}" no canal #${channelName}...`
                    });
                    
                    try {
                        // Realizar a busca
                        const messages = await searchChannelHistory(channelName, keyword);
                        
                        // Salvar no histórico
                        dmBot.saveSearch(user, channelName, keyword, messages);
                        
                        // Gerar e enviar resumo
                        const summary = generateSummary(messages, keyword, channelName);
                        
                        await slackClient.chat.postMessage({
                            channel,
                            text: summary
                        });
                        
                    } catch (error) {
                        await slackClient.chat.postMessage({
                            channel,
                            text: `❌ Erro na busca: ${error.message}`
                        });
                    }
                } else if (text.toLowerCase().trim() === 'search') {
                    // Usuário digitou apenas "search" - mostrar ajuda
                    console.log(`✅ Comando "search" detectado - enviando ajuda`);
                    await slackClient.chat.postMessage({
                        channel,
                        text: `🔍 *Comando de Busca*\n\nPara buscar em um canal, use:\n\`search #canal palavra\`\n\n*Exemplos:*\n• \`search #general teste\`\n• \`search #random "hello world"\`\n\nDigite \`help\` para ver todos os comandos disponíveis.`
                    });
                } else if (text.toLowerCase().trim().startsWith('search')) {
                    // Usuário digitou "search" mas com formato incorreto
                    console.log(`⚠️ Comando "search" com formato incorreto - enviando correção`);
                    await slackClient.chat.postMessage({
                        channel,
                        text: `❓ *Formato incorreto*\n\nO comando deve ser:\n\`search #canal palavra\`\n\n*Exemplos:*\n• \`search #general teste\`\n• \`search #random "hello world"\`\n\nDigite \`help\` para ver todos os comandos.`
                    });
                } else {
                    // Comando não reconhecido
                    console.log(`❓ Comando não reconhecido: "${text}"`);
                    await slackClient.chat.postMessage({
                        channel,
                        text: `❓ Comando não reconhecido. Digite \`help\` para ver os comandos disponíveis.`
                    });
                }
            }
        }
        
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('Erro no endpoint de eventos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint de teste
app.get('/', (req, res) => {
    res.json({
        message: '🤖 Bot de Busca Slack via DM',
        status: 'Ativo',
        endpoints: {
            '/': 'Esta página',
            '/slack/events': 'Webhook do Slack',
            '/health': 'Status de saúde',
            '/test': 'Teste de funcionalidade'
        }
    });
});

// Endpoint de teste para verificar se o bot está funcionando
app.get('/test', async (req, res) => {
    try {
        const auth = await slackClient.auth.test();
        res.json({
            status: '✅ Bot funcionando',
            bot: {
                name: auth.user,
                id: auth.user_id,
                team: auth.team
            },
            timestamp: new Date().toISOString(),
            message: 'O bot está ativo e conectado ao Slack!'
        });
    } catch (error) {
        res.status(500).json({
            status: '❌ Erro no bot',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Endpoint de saúde
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint de debug para verificar configurações
app.get('/debug', (req, res) => {
    res.json({
        status: 'Debug Info',
        timestamp: new Date().toISOString(),
        environment: {
            SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ? '✅ Configurado' : '❌ Não configurado',
            SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET ? '✅ Configurado' : '❌ Não configurado',
            PORT: process.env.PORT || 3000
        },
        bot: {
            name: 'DM Search Bot',
            version: '1.0.0',
            features: [
                'Direct Message handling',
                'Search commands',
                'Special commands (help, history, stats)',
                'Welcome messages',
                'Command validation'
            ]
        },
        endpoints: {
            '/': 'Home page',
            '/slack/events': 'Slack webhook',
            '/health': 'Health check',
            '/test': 'Bot test',
            '/debug': 'This debug info'
        }
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🤖 Bot de DM iniciado na porta ${port}`);
    console.log(`📱 Configure os Event Subscriptions para: http://localhost:${port}/slack/events`);
    console.log(`🔗 Use ngrok para testes locais: ngrok http ${port}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
