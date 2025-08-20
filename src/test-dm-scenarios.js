require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

async function testDMScenarios() {
    console.log('🧪 Testando Cenários de DM com o Bot\n');
    
    try {
        // 1. Verificar autenticação do bot
        const auth = await slackClient.auth.test();
        console.log(`✅ Bot autenticado: @${auth.user} (${auth.user_id})`);
        
        // 2. Listar usuários para encontrar um para testar
        const users = await slackClient.users.list();
        const testUser = users.members.find(u => u.real_name === 'Seu Nome'); // Ajuste aqui
        
        if (!testUser) {
            console.log('⚠️  Ajuste o nome no código para encontrar seu usuário');
            console.log('Usuários disponíveis:');
            users.members.slice(0, 5).forEach(u => {
                console.log(`  - ${u.real_name} (@${u.name})`);
            });
            return;
        }
        
        console.log(`✅ Usuário de teste: @${testUser.name} (${testUser.id})`);
        
        // 3. Abrir DM
        const dm = await slackClient.conversations.open({
            users: testUser.id
        });
        
        console.log(`✅ DM aberta: ${dm.channel.id}`);
        
        // 4. Testar diferentes cenários
        const testScenarios = [
            {
                name: 'Comando "oi"',
                text: 'oi',
                expected: 'Mensagem de boas-vindas'
            },
            {
                name: 'Comando "search"',
                text: 'search',
                expected: 'Ajuda sobre como usar search'
            },
            {
                name: 'Comando "help"',
                text: 'help',
                expected: 'Lista de comandos disponíveis'
            },
            {
                name: 'Comando "history"',
                text: 'history',
                expected: 'Histórico de buscas'
            },
            {
                name: 'Search com formato incorreto',
                text: 'search teste',
                expected: 'Formato incorreto'
            },
            {
                name: 'Search correto',
                text: 'search #general teste',
                expected: 'Execução da busca'
            },
            {
                name: 'Comando desconhecido',
                text: 'xyz',
                expected: 'Comando não reconhecido'
            }
        ];
        
        console.log('\n📝 Testando cenários...\n');
        
        for (const scenario of testScenarios) {
            console.log(`🔍 Testando: ${scenario.name}`);
            console.log(`   Enviando: "${scenario.text}"`);
            
            try {
                await slackClient.chat.postMessage({
                    channel: dm.channel.id,
                    text: scenario.text
                });
                
                console.log(`   ✅ Mensagem enviada - aguarde resposta do bot`);
                console.log(`   📋 Esperado: ${scenario.expected}\n`);
                
                // Aguardar um pouco entre mensagens
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.log(`   ❌ Erro ao enviar: ${error.message}\n`);
            }
        }
        
        console.log('🎯 Todos os cenários foram enviados!');
        console.log('📱 Verifique seu Slack para ver as respostas do bot');
        console.log('\n💡 Dicas para debug:');
        console.log('   • Verifique os logs do bot no terminal');
        console.log('   • Confirme se Event Subscriptions está configurado');
        console.log('   • Verifique se o bot foi reinstalado após mudanças');
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

// Função para testar apenas um cenário específico
async function testSingleScenario(text) {
    console.log(`🧪 Testando cenário específico: "${text}"\n`);
    
    try {
        const auth = await slackClient.auth.test();
        const users = await slackClient.users.list();
        const testUser = users.members.find(u => u.real_name === 'Seu Nome'); // Ajuste aqui
        
        if (!testUser) {
            console.log('⚠️  Ajuste o nome no código para encontrar seu usuário');
            return;
        }
        
        const dm = await slackClient.conversations.open({
            users: testUser.id
        });
        
        await slackClient.chat.postMessage({
            channel: dm.channel.id,
            text: text
        });
        
        console.log(`✅ Mensagem "${text}" enviada para DM`);
        console.log('📱 Verifique seu Slack para a resposta do bot');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Executar testes
if (process.argv[2]) {
    // Testar cenário específico
    testSingleScenario(process.argv[2]);
} else {
    // Testar todos os cenários
    testDMScenarios();
}



