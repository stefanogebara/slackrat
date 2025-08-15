require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: false
});

async function debugChannelIssue() {
    console.log('🔍 Debug: Problema com canal privado\n');
    
    const channelName = 'slackrattest';
    
    try {
        // Método 1: Listar todos os canais
        console.log('Método 1: conversations.list');
        const list1 = await app.client.conversations.list({
            types: 'private_channel',
            exclude_archived: true
        });
        
        const found1 = list1.channels.find(c => c.name === channelName);
        console.log(`  Encontrado: ${found1 ? 'SIM' : 'NÃO'}`);
        if (found1) {
            console.log(`  ID: ${found1.id}`);
            console.log(`  É membro: ${found1.is_member}`);
        }
        
        // Método 2: Tentar com ID diretamente
        if (found1) {
            console.log('\nMétodo 2: conversations.info com ID');
            try {
                const info = await app.client.conversations.info({
                    channel: found1.id
                });
                console.log(`  Nome: ${info.channel.name}`);
                console.log(`  É membro: ${info.channel.is_member}`);
            } catch (e) {
                console.log(`  Erro: ${e.message}`);
            }
        }
        
        // Verificar permissões do bot
        console.log('\n📋 Permissões do Bot:');
        const auth = await app.client.auth.test();
        console.log(`  User ID: ${auth.user_id}`);
        console.log(`  Team: ${auth.team}`);
        
        // Listar TODAS as permissões necessárias
        console.log('\n⚠️  Permissões necessárias no Slack App:');
        console.log('  ✓ channels:history');
        console.log('  ✓ channels:read');
        console.log('  ✓ groups:history');
        console.log('  ✓ groups:read');
        console.log('  ✓ im:history');
        console.log('  ✓ im:read');
        console.log('  ✓ chat:write');
        console.log('  ✓ users:read');
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

debugChannelIssue();
