require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

async function testPermissoes() {
    console.log('🔍 Testando permissões e acesso ao canal #slackrattest\n');
    
    try {
        // 1. Testar autenticação básica
        console.log('1️⃣ Testando autenticação...');
        const auth = await slackClient.auth.test();
        console.log(`✅ Bot autenticado: @${auth.user} (${auth.user_id})`);
        console.log(`   Workspace: ${auth.team} (${auth.team_id})`);
        
        // 2. Testar permissões básicas
        console.log('\n2️⃣ Testando permissões básicas...');
        try {
            const users = await slackClient.users.list();
            console.log(`✅ users:read - OK (${users.members.length} usuários encontrados)`);
        } catch (error) {
            console.log(`❌ users:read - FALHOU: ${error.message}`);
        }
        
        // 3. Testar acesso a canais públicos
        console.log('\n3️⃣ Testando acesso a canais públicos...');
        try {
            const publicChannels = await slackClient.conversations.list({
                types: 'public_channel'
            });
            console.log(`✅ channels:read - OK (${publicChannels.channels.length} canais públicos)`);
        } catch (error) {
            console.log(`❌ channels:read - FALHOU: ${error.message}`);
        }
        
        // 4. Testar acesso a canais privados
        console.log('\n4️⃣ Testando acesso a canais privados...');
        try {
            const privateChannels = await slackClient.conversations.list({
                types: 'private_channel'
            });
            console.log(`✅ groups:read - OK (${privateChannels.channels.length} canais privados)`);
            
            // Procurar pelo canal slackrattest
            const canalEncontrado = privateChannels.channels.find(c => c.name === 'slackrattest');
            if (canalEncontrado) {
                console.log(`✅ Canal #slackrattest encontrado!`);
                console.log(`   ID: ${canalEncontrado.id}`);
                console.log(`   Bot é membro: ${canalEncontrado.is_member ? 'Sim' : 'Não'}`);
                
                // 5. Testar acesso ao histórico do canal
                console.log('\n5️⃣ Testando acesso ao histórico...');
                try {
                    const history = await slackClient.conversations.history({
                        channel: canalEncontrado.id,
                        limit: 10
                    });
                    console.log(`✅ groups:history - OK`);
                    console.log(`   Mensagens encontradas: ${history.messages ? history.messages.length : 0}`);
                    
                    if (history.messages && history.messages.length > 0) {
                        console.log('\n📝 Últimas mensagens:');
                        history.messages.slice(0, 3).forEach((msg, i) => {
                            const text = msg.text ? msg.text.substring(0, 100) + '...' : 'Sem texto';
                            console.log(`   ${i + 1}. ${text}`);
                        });
                        
                        // 6. Testar busca específica por "Round"
                        console.log('\n6️⃣ Testando busca por "Round"...');
                        const keyword = 'Round';
                        const matches = history.messages.filter(msg => 
                            msg.text && msg.text.toLowerCase().includes(keyword.toLowerCase())
                        );
                        
                        console.log(`   Mensagens com "${keyword}": ${matches.length}`);
                        if (matches.length > 0) {
                            matches.forEach((msg, i) => {
                                console.log(`   ✅ ${i + 1}. ${msg.text}`);
                            });
                        }
                    }
                    
                } catch (historyError) {
                    console.log(`❌ groups:history - FALHOU: ${historyError.message}`);
                }
                
            } else {
                console.log(`❌ Canal #slackrattest não encontrado na lista de canais privados`);
                console.log('\n📋 Canais privados disponíveis:');
                privateChannels.channels.forEach(channel => {
                    console.log(`   - #${channel.name} (ID: ${channel.id})`);
                });
            }
            
        } catch (error) {
            console.log(`❌ groups:read - FALHOU: ${error.message}`);
        }
        
        // 7. Testar permissão de escrita
        console.log('\n7️⃣ Testando permissão de escrita...');
        try {
            const testMessage = await slackClient.chat.postMessage({
                channel: auth.user_id, // DM para o próprio bot
                text: '🧪 Teste de permissão de escrita'
            });
            console.log(`✅ chat:write - OK`);
            // Deletar a mensagem de teste
            await slackClient.chat.delete({
                channel: auth.user_id,
                ts: testMessage.ts
            });
        } catch (error) {
            console.log(`❌ chat:write - FALHOU: ${error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
    
    console.log('\n🔍 RESUMO DAS PERMISSÕES NECESSÁRIAS:');
    console.log('Para canais privados, o bot precisa de:');
    console.log('✅ groups:read - Listar canais privados');
    console.log('✅ groups:history - Ler histórico de canais privados');
    console.log('✅ channels:read - Listar canais públicos');
    console.log('✅ channels:history - Ler histórico de canais públicos');
    console.log('✅ users:read - Obter informações de usuários');
    console.log('✅ chat:write - Enviar mensagens');
}

testPermissoes();
