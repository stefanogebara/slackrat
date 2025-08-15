require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: false
});

async function testChannelAccess() {
    console.log('🧪 Testando acesso aos canais...\n');
    
    try {
        // 1. Verificar autenticação
        const auth = await app.client.auth.test();
        console.log(`✅ Bot autenticado: @${auth.user}`);
        
        // 2. Buscar canal específico slackrattest
        const targetChannel = 'slackrattest';
        console.log(`\n🔍 Procurando canal "${targetChannel}"...`);
        
        // Método 1: Tentar buscar diretamente
        try {
            const channelInfo = await app.client.conversations.info({
                channel: targetChannel
            });
            console.log(`✅ Canal encontrado via info: #${channelInfo.channel.name} (${channelInfo.channel.id})`);
            console.log(`   Tipo: ${channelInfo.channel.is_private ? 'Privado' : 'Público'}`);
            console.log(`   Bot é membro: ${channelInfo.channel.is_member ? 'SIM' : 'NÃO'}`);
            
            if (channelInfo.channel.is_member) {
                // Tentar buscar histórico
                console.log('\n📖 Testando acesso ao histórico...');
                const history = await app.client.conversations.history({
                    channel: channelInfo.channel.id,
                    limit: 5
                });
                
                console.log(`✅ Consegui acessar! ${history.messages.length} mensagens recentes`);
                
                // Buscar por "Round"
                const keyword = 'round';
                console.log(`\n🔍 Buscando por "${keyword}"...`);
                
                const allMessages = await app.client.conversations.history({
                    channel: channelInfo.channel.id,
                    limit: 1000
                });
                
                const matches = allMessages.messages.filter(msg => 
                    msg.text && msg.text.toLowerCase().includes(keyword.toLowerCase())
                );
                
                console.log(`✅ Encontradas ${matches.length} menções a "${keyword}"`);
                
                if (matches.length > 0) {
                    console.log('\nPrimeiras 3 menções:');
                    matches.slice(0, 3).forEach((msg, i) => {
                        console.log(`${i + 1}. "${msg.text.substring(0, 100)}..."`);
                    });
                }
            } else {
                console.log('\n⚠️  O bot NÃO é membro deste canal!');
                console.log('   Execute no Slack: /invite @SlackRat');
            }
        } catch (error) {
            console.log(`❌ Erro ao buscar canal: ${error.message}`);
        }
        
        // 3. Listar canais onde o bot é membro (para referência)
        console.log('\n📋 Canais onde o bot é membro:');
        console.log('================================');
        
        try {
            const memberChannels = await app.client.users.conversations({
                user: auth.user_id,
                types: 'public_channel,private_channel'
            });
            
            if (memberChannels.channels && memberChannels.channels.length > 0) {
                memberChannels.channels.forEach(channel => {
                    const type = channel.is_private ? '🔒 Privado' : '📢 Público';
                    console.log(`✅ ${type} #${channel.name} (${channel.id})`);
                });
            } else {
                console.log('❌ Bot não é membro de nenhum canal');
            }
        } catch (error) {
            console.log(`❌ Erro ao listar canais: ${error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.data) {
            console.error('Detalhes:', error.data);
        }
    }
}

// Executar teste
testChannelAccess();

