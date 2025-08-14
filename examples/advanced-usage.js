require('dotenv').config();
const SlackSearchAgent = require('../src/utils');
const AdvancedSlackAgent = require('../src/advanced');

/**
 * Exemplos de uso avançado do Slack Search Agent
 */

async function examples() {
    console.log('🚀 EXEMPLOS DE USO AVANÇADO DO SLACK SEARCH AGENT\n');
    
    // Inicializar o agente básico
    const basicAgent = new SlackSearchAgent(process.env.SLACK_BOT_TOKEN);
    
    // Inicializar o agente avançado (se configurado)
    let advancedAgent = null;
    if (process.env.SLACK_SIGNING_SECRET) {
        advancedAgent = new AdvancedSlackAgent(
            process.env.SLACK_BOT_TOKEN,
            process.env.SLACK_SIGNING_SECRET
        );
    }
    
    // ==========================================
    // EXEMPLO 1: Busca em múltiplos canais
    // ==========================================
    
    console.log('📺 EXEMPLO 1: Busca em múltiplos canais');
    console.log('=' .repeat(50));
    
    try {
        // Primeiro, vamos listar os canais disponíveis
        const channels = await basicAgent.getAvailableChannels();
        console.log(`📋 Canais disponíveis: ${channels.length}`);
        
        if (channels.length > 0) {
            // Pegar os primeiros 3 canais para teste
            const testChannels = channels.slice(0, 3).map(c => c.id);
            console.log(`🔍 Testando busca em: ${testChannels.join(', ')}`);
            
            const multiResults = await basicAgent.searchMultipleChannels(
                testChannels,
                'deploy',
                { limit: 100 }
            );
            
            console.log(`✅ Busca concluída em ${multiResults.successfulChannels} canais`);
            console.log(`📊 Total de resultados: ${multiResults.totalMatches}`);
            
            // Mostrar resultados por canal
            multiResults.channelResults.forEach(result => {
                if (result.success) {
                    console.log(`   📺 ${result.channel}: ${result.matchesFound} resultados`);
                } else {
                    console.log(`   ❌ ${result.channel}: ${result.error}`);
                }
            });
        }
    } catch (error) {
        console.error('❌ Erro no exemplo 1:', error.message);
    }
    
    console.log('\n');
    
    // ==========================================
    // EXEMPLO 2: Busca por múltiplas palavras-chave
    // ==========================================
    
    console.log('🔍 EXEMPLO 2: Busca por múltiplas palavras-chave');
    console.log('=' .repeat(50));
    
    try {
        const channelId = process.env.DEFAULT_CHANNEL || 'C1234567890';
        const keywords = ['deploy', 'bug', 'reunião', 'teste'];
        
        console.log(`📝 Buscando por: ${keywords.join(', ')}`);
        
        const multiKeywordResults = await basicAgent.searchMultipleKeywords(
            channelId,
            keywords,
            { limit: 50 }
        );
        
        Object.entries(multiKeywordResults).forEach(([keyword, result]) => {
            if (result.success) {
                console.log(`   ✅ "${keyword}": ${result.matchesFound} resultados`);
            } else {
                console.log(`   ❌ "${keyword}": ${result.error}`);
            }
        });
    } catch (error) {
        console.error('❌ Erro no exemplo 2:', error.message);
    }
    
    console.log('\n');
    
    // ==========================================
    // EXEMPLO 3: Busca por período específico
    // ==========================================
    
    console.log('📅 EXEMPLO 3: Busca por período específico');
    console.log('=' .repeat(50));
    
    try {
        const channelId = process.env.DEFAULT_CHANNEL || 'C1234567890';
        
        // Buscar mensagens dos últimos 7 dias
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        console.log(`📅 Período: ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}`);
        
        const timeResults = await basicAgent.searchInTimeRange(
            channelId,
            'deploy',
            startDate,
            endDate,
            { limit: 200 }
        );
        
        if (timeResults.success) {
            console.log(`✅ ${timeResults.matchesFound} resultados encontrados`);
            console.log(`📊 Total de mensagens no período: ${timeResults.totalMessages}`);
        } else {
            console.log(`❌ Erro: ${timeResults.error}`);
        }
    } catch (error) {
        console.error('❌ Erro no exemplo 3:', error.message);
    }
    
    console.log('\n');
    
    // ==========================================
    // EXEMPLO 4: Busca por padrões regex
    // ==========================================
    
    console.log('🔍 EXEMPLO 4: Busca por padrões regex');
    console.log('=' .repeat(50));
    
    try {
        const channelId = process.env.DEFAULT_CHANNEL || 'C1234567890';
        
        // Buscar mensagens que contenham "deploy" seguido de "prod" ou "staging"
        const pattern = 'deploy.*(prod|staging)';
        
        console.log(`🔍 Padrão regex: ${pattern}`);
        
        const regexResults = await basicAgent.searchByPattern(
            channelId,
            pattern,
            { caseSensitive: false, limit: 100 }
        );
        
        if (regexResults.success) {
            console.log(`✅ ${regexResults.matchesFound} resultados encontrados`);
            
            // Mostrar algumas mensagens que correspondem ao padrão
            regexResults.results.slice(0, 3).forEach((msg, i) => {
                console.log(`   ${i + 1}. "${msg.text.substring(0, 80)}..."`);
            });
        } else {
            console.log(`❌ Erro: ${regexResults.error}`);
        }
    } catch (error) {
        console.error('❌ Erro no exemplo 4:', error.message);
    }
    
    console.log('\n');
    
    // ==========================================
    // EXEMPLO 5: Análise de sentimento
    // ==========================================
    
    console.log('😊 EXEMPLO 5: Análise de sentimento');
    console.log('=' .repeat(50));
    
    try {
        const testMessages = [
            'Deploy foi um sucesso! Tudo funcionando perfeitamente.',
            'Temos um problema crítico no sistema de produção.',
            'Reunião foi produtiva, conseguimos resolver vários bugs.',
            'Falha no deploy, precisamos reverter imediatamente.',
            'Teste passou com sucesso, podemos fazer o merge.'
        ];
        
        testMessages.forEach((message, i) => {
            const sentiment = basicAgent.analyzeSentiment(message);
            const emoji = sentiment.sentiment === 'positive' ? '😊' : 
                         sentiment.sentiment === 'negative' ? '😞' : '😐';
            
            console.log(`${i + 1}. ${emoji} "${message}"`);
            console.log(`   Sentimento: ${sentiment.sentiment} (score: ${sentiment.score})`);
            console.log(`   Confiança: ${(sentiment.confidence * 100).toFixed(1)}%`);
            console.log('');
        });
    } catch (error) {
        console.error('❌ Erro no exemplo 5:', error.message);
    }
    
    console.log('\n');
    
    // ==========================================
    // EXEMPLO 6: Análise de frequência de palavras
    // ==========================================
    
    console.log('📊 EXEMPLO 6: Análise de frequência de palavras');
    console.log('=' .repeat(50));
    
    try {
        const channelId = process.env.DEFAULT_CHANNEL || 'C1234567890';
        
        // Buscar algumas mensagens para análise
        const results = await basicAgent.searchChannel(channelId, '', { limit: 50 });
        
        if (results.success && results.results.length > 0) {
            // Combinar todas as mensagens
            const allText = results.results
                .map(r => r.message.text || '')
                .join(' ');
            
            // Analisar frequência de palavras
            const wordFreq = basicAgent.analyzeWordFrequency(allText, ['deploy', 'bug', 'teste']);
            
            console.log('📝 Palavras mais frequentes:');
            wordFreq.slice(0, 10).forEach((item, i) => {
                console.log(`   ${i + 1}. "${item.word}": ${item.count} vezes`);
            });
        }
    } catch (error) {
        console.error('❌ Erro no exemplo 6:', error.message);
    }
    
    console.log('\n');
    
    // ==========================================
    // EXEMPLO 7: Usuários mais ativos
    // ==========================================
    
    console.log('👥 EXEMPLO 7: Usuários mais ativos');
    console.log('=' .repeat(50));
    
    try {
        const channelId = process.env.DEFAULT_CHANNEL || 'C1234567890';
        
        console.log('🔍 Analisando usuários ativos nos últimos 30 dias...');
        
        const activeUsers = await basicAgent.getActiveUsers(channelId, 30);
        
        if (activeUsers.length > 0) {
            console.log(`👥 ${activeUsers.length} usuários ativos encontrados:`);
            
            activeUsers.slice(0, 10).forEach((user, i) => {
                const botIcon = user.isBot ? '🤖' : '👤';
                console.log(`   ${i + 1}. ${botIcon} ${user.name}: ${user.messageCount} mensagens`);
            });
        } else {
            console.log('❌ Nenhum usuário ativo encontrado');
        }
    } catch (error) {
        console.error('❌ Erro no exemplo 7:', error.message);
    }
    
    console.log('\n');
    
    // ==========================================
    // EXEMPLO 8: Exportação de dados
    // ==========================================
    
    console.log('📤 EXEMPLO 8: Exportação de dados');
    console.log('=' .repeat(50));
    
    try {
        const channelId = process.env.DEFAULT_CHANNEL || 'C1234567890';
        
        // Buscar resultados para exportação
        const results = await basicAgent.searchChannel(channelId, 'deploy', { limit: 20 });
        
        if (results.success && results.results.length > 0) {
            // Exportar para CSV
            const csv = basicAgent.exportToCSV(results);
            console.log(`📊 CSV gerado com ${results.results.length} linhas`);
            console.log('📝 Primeiras linhas:');
            console.log(csv.split('\n').slice(0, 3).join('\n'));
            
            // Exportar para JSON
            const json = basicAgent.exportToJSON(results);
            console.log(`\n📄 JSON gerado com ${json.length} caracteres`);
            
            // Salvar arquivos (opcional)
            const fs = require('fs');
            fs.writeFileSync('export-results.csv', csv);
            fs.writeFileSync('export-results.json', json);
            console.log('💾 Arquivos salvos: export-results.csv e export-results.json');
        }
    } catch (error) {
        console.error('❌ Erro no exemplo 8:', error.message);
    }
    
    console.log('\n');
    
    // ==========================================
    // EXEMPLO 9: Agente avançado (se configurado)
    // ==========================================
    
    if (advancedAgent) {
        console.log('🚀 EXEMPLO 9: Agente avançado');
        console.log('=' .repeat(50));
        
        console.log('✅ Agente avançado configurado!');
        console.log('🔌 Slash Commands disponíveis: /search, /searchhelp');
        console.log('🌐 Webhooks configurados para eventos e comandos');
        console.log('📱 Funcionalidades de menção e interação ativas');
        
        // Aqui você pode testar funcionalidades específicas do agente avançado
        // como slash commands, webhooks, etc.
    } else {
        console.log('⚠️  EXEMPLO 9: Agente avançado');
        console.log('=' .repeat(50));
        console.log('❌ Agente avançado não configurado');
        console.log('💡 Configure SLACK_SIGNING_SECRET no .env para ativar');
        console.log('📖 Veja SLACK_SETUP.md para instruções completas');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 EXEMPLOS CONCLUÍDOS!');
    console.log('\n💡 Dicas para uso em produção:');
    console.log('   • Implemente rate limiting para evitar sobrecarga');
    console.log('   • Use cache Redis para melhor performance');
    console.log('   • Configure logs estruturados');
    console.log('   • Monitore uso da API do Slack');
    console.log('   • Implemente tratamento de erros robusto');
}

// Executar exemplos
examples().catch(console.error);

