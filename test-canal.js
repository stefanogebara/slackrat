require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

async function testCanal() {
    console.log('🔍 Testando acesso ao canal #slackrattest\n');
    
    try {
        // Testar autenticação
        const auth = await slackClient.auth.test();
        console.log(`✅ Bot autenticado: @${auth.user} (${auth.user_id})`);
        
        // Listar todos os canais
        console.log('\n📋 Listando canais disponíveis:');
        const channels = await slackClient.conversations.list({
            types: 'public_channel,private_channel'
        });
        
        const canalEncontrado = channels.channels.find(c => c.name === 'slackrattest');
        
        if (canalEncontrado) {
            console.log(`✅ Canal #slackrattest encontrado!`);
            console.log(`   ID: ${canalEncontrado.id}`);
            console.log(`   Privado: ${canalEncontrado.is_private ? 'Sim' : 'Não'}`);
            console.log(`   Bot é membro: ${canalEncontrado.is_member ? 'Sim' : 'Não'}`);
            
            // Tentar entrar no canal se não for membro
            if (!canalEncontrado.is_member) {
                console.log('\n🔑 Tentando entrar no canal...');
                try {
                    await slackClient.conversations.join({ channel: canalEncontrado.id });
                    console.log('✅ Bot entrou no canal com sucesso!');
                } catch (joinError) {
                    console.log(`❌ Erro ao entrar no canal: ${joinError.message}`);
                }
            }
            
            // Tentar buscar histórico
            console.log('\n📚 Testando busca de histórico...');
            try {
                const history = await slackClient.conversations.history({
                    channel: canalEncontrado.id,
                    limit: 10
                });
                
                console.log(`✅ Histórico acessível!`);
                console.log(`   Mensagens encontradas: ${history.messages ? history.messages.length : 0}`);
                
                if (history.messages && history.messages.length > 0) {
                    console.log('\n📝 Últimas mensagens:');
                    history.messages.slice(0, 3).forEach((msg, i) => {
                        const text = msg.text ? msg.text.substring(0, 50) + '...' : 'Sem texto';
                        console.log(`   ${i + 1}. ${text}`);
                    });
                }
                
            } catch (historyError) {
                console.log(`❌ Erro ao buscar histórico: ${historyError.message}`);
            }
            
        } else {
            console.log('❌ Canal #slackrattest não encontrado!');
            console.log('\n📋 Canais disponíveis:');
            channels.channels.forEach(channel => {
                console.log(`   - #${channel.name} (${channel.is_private ? 'privado' : 'público'})`);
            });
        }
        
        // Testar busca por palavra-chave
        if (canalEncontrado) {
            console.log('\n🔍 Testando busca por "Round"...');
            try {
                const history = await slackClient.conversations.history({
                    channel: canalEncontrado.id,
                    limit: 100
                });
                
                if (history.messages && history.messages.length > 0) {
                    const keyword = 'Round';
                    const matches = history.messages.filter(msg => 
                        msg.text && msg.text.toLowerCase().includes(keyword.toLowerCase())
                    );
                    
                    console.log(`✅ Busca concluída!`);
                    console.log(`   Mensagens analisadas: ${history.messages.length}`);
                    console.log(`   Mensagens com "${keyword}": ${matches.length}`);
                    
                    if (matches.length > 0) {
                        console.log('\n📝 Mensagens encontradas:');
                        matches.slice(0, 3).forEach((msg, i) => {
                            console.log(`   ${i + 1}. ${msg.text}`);
                        });
                    } else {
                        console.log(`   Nenhuma mensagem encontrada com "${keyword}"`);
                    }
                }
                
            } catch (searchError) {
                console.log(`❌ Erro na busca: ${searchError.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

testCanal();
