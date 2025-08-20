require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

async function debugChannelSearch() {
    console.log('🔍 Debugando busca de canal...\n');
    
    try {
        // Simular a busca do bot
        const channelName = 'slackrattest'; // sem #
        console.log(`🔍 Procurando por canal: "${channelName}"`);
        
        // Testar diferentes métodos de busca
        console.log('\n1️⃣ Testando conversations.list (método do bot):');
        const channels1 = await slackClient.conversations.list({
            types: 'public_channel,private_channel',
            exclude_archived: true,
            limit: 1000
        });
        console.log(`   Total: ${channels1.channels.length} canais`);
        
        console.log('\n2️⃣ Testando conversations.list sem limit:');
        const channels2 = await slackClient.conversations.list({
            types: 'public_channel,private_channel',
            exclude_archived: true
        });
        console.log(`   Total: ${channels2.channels.length} canais`);
        
        console.log('\n3️⃣ Testando conversations.list apenas públicos:');
        const channels3 = await slackClient.conversations.list({
            types: 'public_channel',
            exclude_archived: true
        });
        console.log(`   Total: ${channels3.channels.length} canais públicos`);
        
        console.log('\n4️⃣ Testando conversations.list apenas privados:');
        const channels4 = await slackClient.conversations.list({
            types: 'private_channel',
            exclude_archived: true
        });
        console.log(`   Total: ${channels4.channels.length} canais privados`);
        
        // Procurar pelo canal específico em todas as listas
        console.log('\n🔍 Procurando por "slackrattest" em cada lista:');
        
        const found1 = channels1.channels.find(c => c.name === channelName);
        const found2 = channels2.channels.find(c => c.name === channelName);
        const found3 = channels3.channels.find(c => c.name === channelName);
        const found4 = channels4.channels.find(c => c.name === channelName);
        
        console.log(`   Lista 1 (bot): ${found1 ? '✅' : '❌'}`);
        console.log(`   Lista 2 (sem limit): ${found2 ? '✅' : '❌'}`);
        console.log(`   Lista 3 (públicos): ${found3 ? '✅' : '❌'}`);
        console.log(`   Lista 4 (privados): ${found4 ? '✅' : '❌'}`);
        
        // Se encontrou em alguma lista, mostrar detalhes
        if (found1 || found2 || found3 || found4) {
            const found = found1 || found2 || found3 || found4;
            console.log(`\n✅ Canal encontrado!`);
            console.log(`   Nome: ${found.name}`);
            console.log(`   ID: ${found.id}`);
            console.log(`   Privado: ${found.is_private ? 'Sim' : 'Não'}`);
            console.log(`   Bot é membro: ${found.is_member ? 'Sim' : 'Não'}`);
        } else {
            console.log(`\n❌ Canal não encontrado em nenhuma lista!`);
            
            // Mostrar alguns canais de cada lista para debug
            console.log('\n📋 Amostra de canais públicos:');
            channels3.channels.slice(0, 5).forEach(ch => {
                console.log(`   - ${ch.name}`);
            });
            
            console.log('\n📋 Canais privados:');
            channels4.channels.forEach(ch => {
                console.log(`   - ${ch.name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

debugChannelSearch();
