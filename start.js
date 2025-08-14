#!/usr/bin/env node

require('dotenv').config();
const { spawn } = require('child_process');
const readline = require('readline');

/**
 * Script de inicialização rápida do Slack Search Agent
 * Permite escolher entre diferentes modos de execução
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showBanner() {
    console.log(`
🔍 SLACK SEARCH AGENT
═══════════════════════════════════════════════════════════════
Um agente inteligente de busca para mensagens do Slack
═══════════════════════════════════════════════════════════════
    `);
}

function showMenu() {
    console.log(`
📋 MODOS DE EXECUÇÃO DISPONÍVEIS:

1️⃣  🚀 SERVIDOR COMPLETO
    • Interface web + API REST
    • Porta padrão: 3000
    • Modo: Produção

2️⃣  🔧 DESENVOLVIMENTO
    • Servidor com auto-reload
    • Porta padrão: 3000
    • Modo: Desenvolvimento

3️⃣  🧪 TESTES
    • Executar testes de validação
    • Verificar configuração
    • Modo: Teste

4️⃣  📚 EXEMPLOS AVANÇADOS
    • Demonstrar funcionalidades
    • Testar recursos especiais
    • Modo: Demonstração

5️⃣  🚀 AGENTE AVANÇADO
    • Slash Commands + Webhooks
    • Porta: 3001
    • Modo: Avançado

6️⃣  💬 BOT DE DM
    • Bot que funciona via Direct Message
    • Porta: 3000
    • Modo: DM

7️⃣  🧪 TESTAR CENÁRIOS DE DM
    • Testar diferentes comandos DM
    • Verificar respostas do bot
    • Modo: Teste DM

8️⃣  📖 AJUDA E CONFIGURAÇÃO
    • Verificar configuração
    • Mostrar instruções
    • Modo: Configuração

0️⃣  ❌ SAIR
    `);
}

function checkConfiguration() {
    console.log('\n🔍 VERIFICANDO CONFIGURAÇÃO...\n');
    
    const required = ['SLACK_BOT_TOKEN'];
    const optional = ['SLACK_SIGNING_SECRET', 'DEFAULT_CHANNEL', 'PORT'];
    
    console.log('📋 Variáveis obrigatórias:');
    required.forEach(key => {
        const value = process.env[key];
        if (value && value !== 'xoxb-seu-token-aqui') {
            console.log(`   ✅ ${key}: Configurado`);
        } else {
            console.log(`   ❌ ${key}: Não configurado`);
        }
    });
    
    console.log('\n📋 Variáveis opcionais:');
    optional.forEach(key => {
        const value = process.env[key];
        if (value && value !== 'seu-signing-secret-aqui') {
            console.log(`   ✅ ${key}: ${value}`);
        } else {
            console.log(`   ⚠️  ${key}: Não configurado (usando padrão)`);
        }
    });
    
    console.log('\n🔧 Status da configuração:');
    
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_BOT_TOKEN !== 'xoxb-seu-token-aqui') {
        console.log('   ✅ Configuração básica: OK');
        
        if (process.env.SLACK_SIGNING_SECRET && process.env.SLACK_SIGNING_SECRET !== 'seu-signing-secret-aqui') {
            console.log('   ✅ Configuração avançada: OK');
            console.log('   🚀 Slash Commands e Webhooks disponíveis');
        } else {
            console.log('   ⚠️  Configuração avançada: Parcial');
            console.log('   💡 Configure SLACK_SIGNING_SECRET para funcionalidades avançadas');
        }
    } else {
        console.log('   ❌ Configuração básica: Faltando SLACK_BOT_TOKEN');
        console.log('   📖 Veja SLACK_SETUP.md para instruções de configuração');
    }
}

function showInstructions() {
    console.log(`
📖 INSTRUÇÕES DE CONFIGURAÇÃO:

1️⃣  CONFIGURAR SLACK APP:
   • Acesse api.slack.com/apps
   • Crie um novo app "From scratch"
   • Configure as permissões necessárias
   • Instale no workspace
   • Copie o Bot User OAuth Token

2️⃣  CONFIGURAR ARQUIVO .ENV:
   • Copie .env.example para .env
   • Cole seu token do Slack
   • Configure outras variáveis conforme necessário

3️⃣  TESTAR CONFIGURAÇÃO:
   • Execute: npm test
   • Verifique se não há erros
   • Configure o ID do canal padrão

4️⃣  INICIAR SERVIDOR:
   • Execute: npm start
   • Acesse: http://localhost:3000

📚 DOCUMENTAÇÃO COMPLETA:
   • README.md - Visão geral e uso básico
   • SLACK_SETUP.md - Configuração detalhada do Slack
   • examples/advanced-usage.js - Exemplos avançados

🔗 LINKS ÚTEIS:
   • API Slack: https://api.slack.com/
   • Documentação: https://api.slack.com/docs
   • Apps: https://api.slack.com/apps
    `);
}

function startServer(mode = 'production') {
    const port = process.env.PORT || 3000;
    
    console.log(`\n🚀 INICIANDO SERVIDOR ${mode.toUpperCase()}...`);
    console.log(`🌐 Porta: ${port}`);
    console.log(`🔗 URL: http://localhost:${port}`);
    
    if (mode === 'development') {
        console.log('🔄 Modo desenvolvimento com auto-reload ativo');
        const child = spawn('npm', ['run', 'dev'], { 
            stdio: 'inherit',
            shell: true 
        });
        
        child.on('error', (error) => {
            console.error('❌ Erro ao iniciar servidor:', error.message);
        });
        
        return child;
    } else {
        console.log('⚡ Modo produção');
        const child = spawn('npm', ['start'], { 
            stdio: 'inherit',
            shell: true 
        });
        
        child.on('error', (error) => {
            console.error('❌ Erro ao iniciar servidor:', error.message);
        });
        
        return child;
    }
}

function startAdvancedAgent() {
    if (!process.env.SLACK_SIGNING_SECRET || process.env.SLACK_SIGNING_SECRET === 'seu-signing-secret-aqui') {
        console.log('\n❌ AGENTE AVANÇADO NÃO CONFIGURADO');
        console.log('💡 Configure SLACK_SIGNING_SECRET no arquivo .env');
        console.log('📖 Veja SLACK_SETUP.md para instruções completas');
        return;
    }
    
    console.log('\n🚀 INICIANDO AGENTE AVANÇADO...');
    console.log('🔌 Slash Commands: /search, /searchhelp');
    console.log('🌐 Webhooks configurados');
    console.log('📱 Funcionalidades de menção ativas');
    
    const AdvancedSlackAgent = require('./src/advanced');
    const agent = new AdvancedSlackAgent(
        process.env.SLACK_BOT_TOKEN,
        process.env.SLACK_SIGNING_SECRET
    );
    
    agent.start(3001);
    
    console.log('\n✅ Agente avançado iniciado na porta 3001');
    console.log('🔗 Webhooks: http://localhost:3001/slack/*');
    console.log('💡 Use ngrok para testar com o Slack');
}

function startDMBot() {
    console.log('\n💬 INICIANDO BOT DE DM...');
    
    const child = spawn('npm', ['run', 'dm'], { 
        stdio: 'inherit',
        shell: true 
    });
    
    child.on('error', (error) => {
        console.error('❌ Erro ao iniciar bot de DM:', error.message);
    });
    
    console.log('\n✅ Bot de DM iniciado na porta 3000');
    console.log('📱 Configure Event Subscriptions para: http://localhost:3000/slack/events');
    console.log('💡 Use ngrok para testar com o Slack');
    console.log('🔍 Comandos disponíveis: search #canal palavra, help, history');
    
    return child;
}

function startTestScenarios() {
    console.log('\n🧪 INICIANDO TESTES DE CENÁRIOS DM...');
    
    const child = spawn('npm', ['run', 'test:scenarios'], { 
        stdio: 'inherit',
        shell: true 
    });
    
    child.on('error', (error) => {
        console.error('❌ Erro ao executar testes de cenários:', error.message);
    });
    
    console.log('\n✅ Testes de cenários iniciados!');
    console.log('📱 O script enviará mensagens de teste para sua DM');
    console.log('💡 Ajuste o nome do usuário no arquivo src/test-dm-scenarios.js');
    console.log('🔍 Verifique as respostas do bot no Slack');
    
    return child;
}

function runTests() {
    console.log('\n🧪 EXECUTANDO TESTES...');
    
    const child = spawn('npm', ['test'], { 
        stdio: 'inherit',
        shell: true 
    });
    
    child.on('error', (error) => {
        console.error('❌ Erro ao executar testes:', error.message);
    });
}

function runExamples() {
    console.log('\n📚 EXECUTANDO EXEMPLOS AVANÇADOS...');
    
    const child = spawn('node', ['examples/advanced-usage.js'], { 
        stdio: 'inherit',
        shell: true 
    });
    
    child.on('error', (error) => {
        console.error('❌ Erro ao executar exemplos:', error.message);
    });
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function main() {
    showBanner();
    
    let running = true;
    let currentProcess = null;
    
    while (running) {
        showMenu();
        
        const choice = await askQuestion('\n🎯 Escolha uma opção (0-8): ');
        
        // Parar processo atual se houver
        if (currentProcess) {
            currentProcess.kill();
            currentProcess = null;
            console.log('\n🛑 Processo anterior interrompido');
        }
        
        switch (choice) {
            case '1':
                console.log('\n🚀 Iniciando servidor completo...');
                currentProcess = startServer('production');
                break;
                
            case '2':
                console.log('\n🔧 Iniciando modo desenvolvimento...');
                currentProcess = startServer('development');
                break;
                
            case '3':
                runTests();
                break;
                
            case '4':
                runExamples();
                break;
                
            case '5':
                startAdvancedAgent();
                break;
                
            case '6':
                console.log('\n💬 Iniciando bot de DM...');
                currentProcess = startDMBot();
                break;
                
            case '7':
                console.log('\n🧪 Iniciando testes de cenários DM...');
                currentProcess = startTestScenarios();
                break;
                
            case '8':
                checkConfiguration();
                showInstructions();
                break;
                
            case '0':
                console.log('\n👋 Até logo!');
                running = false;
                break;
                
            default:
                console.log('\n❌ Opção inválida. Tente novamente.');
        }
        
        if (choice !== '0' && choice !== '3' && choice !== '4' && choice !== '6' && choice !== '7') {
            console.log('\n💡 Pressione Ctrl+C para parar o servidor');
            console.log('🔄 Execute novamente para escolher outra opção');
        }
        
        if (choice !== '0') {
            await askQuestion('\n⏸️  Pressione Enter para continuar...');
        }
    }
    
    rl.close();
}

// Tratamento de interrupção
process.on('SIGINT', () => {
    console.log('\n\n🛑 Interrompendo...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Encerrando...');
    process.exit(0);
});

// Verificar se é execução direta
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    startServer,
    startAdvancedAgent,
    runTests,
    runExamples,
    checkConfiguration
};
