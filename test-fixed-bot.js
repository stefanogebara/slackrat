require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

async function testFixedBotLogic() {
    console.log('🧪 Testando lógica corrigida do bot...\n');
    
    try {
        const channelName = 'slackrattest';
        console.log(`🔍 Procurando por canal: "${channelName}"`);
        
        // Simular a lógica corrigida do bot
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
        
        // Procurar pelo canal
        const channel = allChannels.find(c => c.name === channelName);
        
        if (channel) {
            console.log(`\n✅ Canal encontrado!`);
            console.log(`   Nome: ${channel.name}`);
            console.log(`   ID: ${channel.id}`);
            console.log(`   Privado: ${channel.is_private ? 'Sim' : 'Não'}`);
            console.log(`   Bot é membro: ${channel.is_member ? 'Sim' : 'Não'}`);
            
            // Testar se consegue acessar o histórico
            console.log('\n📚 Testando acesso ao histórico...');
            try {
                const history = await slackClient.conversations.history({
                    channel: channel.id,
                    limit: 10
                });
                console.log(`   ✅ Histórico acessível! ${history.messages ? history.messages.length : 0} mensagens`);
                
                // Testar busca por palavra-chave
                if (history.messages && history.messages.length > 0) {
                    const keyword = 'Round';
                    const matches = history.messages.filter(msg => 
                        msg.text && msg.text.toLowerCase().includes(keyword.toLowerCase())
                    );
                    console.log(`   🔍 Busca por "${keyword}": ${matches.length} mensagens encontradas`);
                }
                
            } catch (historyError) {
                console.log(`   ❌ Erro ao acessar histórico: ${historyError.message}`);
            }
            
        } else {
            console.log(`\n❌ Canal não encontrado!`);
            console.log('\n📋 Canais disponíveis (primeiros 10):');
            allChannels.slice(0, 10).forEach(ch => {
                console.log(`   - ${ch.name} (${ch.is_private ? 'privado' : 'público'})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

testFixedBotLogic();

