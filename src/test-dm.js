require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

async function testDirectMessage() {
    console.log('🧪 Teste de DM com o Bot\n');
    try {
        const auth = await slackClient.auth.test();
        const botUserId = auth.user_id;
        console.log(`✅ Bot: @${auth.user} (${botUserId})`);
        
        const users = await slackClient.users.list();
        const you = users.members.find(u => u.real_name === 'Seu Nome'); // Ajuste aqui
        
        if (!you) {
            console.log('⚠️  Ajuste o nome no código para encontrar seu usuário');
            console.log('Usuários disponíveis:');
            users.members.slice(0, 5).forEach(u => {
                console.log(`  - ${u.real_name} (@${u.name})`);
            });
            return;
        }
        
        console.log(`✅ Você: @${you.name} (${you.id})`);
        
        const dm = await slackClient.conversations.open({
            users: you.id
        });
        
        console.log(`✅ DM aberta: ${dm.channel.id}`);
        
        await slackClient.chat.postMessage({
            channel: dm.channel.id,
            text: '👋 Olá! Sou o bot de busca.',
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🤖 Bot de Busca Ativo!"
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "Estou pronto para buscar em canais!\n\n*Me envie:*\n`search #general teste`\n\nE eu buscarei todas as menções a 'teste' no canal #general"
                    }
                }
            ]
        });
        
        console.log('✅ Mensagem de teste enviada!');
        console.log('\n📱 Verifique seu Slack - você deve ter recebido uma DM do bot');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testDirectMessage();



