require('dotenv').config();
const express = require('express');
const { WebClient } = require('@slack/web-api');
const NodeCache = require('node-cache');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Slack
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 3600 });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Função principal de busca no histórico do canal
 */
async function searchChannelHistory(channelId, keyword, options = {}) {
    const {
        limit = 1000,
        includeContext = true,
        contextSize = 2,
        searchInThreads = true,
        oldest = null,
        latest = null
    } = options;

    try {
        console.log(`🔍 Iniciando busca por "${keyword}" no canal ${channelId}`);
        
        // Verificar cache primeiro
        const cacheKey = `search_${channelId}_${keyword}_${limit}`;
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            console.log('📦 Resultado encontrado no cache');
            return cachedResult;
        }

        // Buscar histórico do canal
        const historyParams = {
            channel: channelId,
            limit: limit
        };

        if (oldest) historyParams.oldest = oldest;
        if (latest) historyParams.latest = latest;

        const result = await slack.conversations.history(historyParams);
        
        if (!result.ok) {
            throw new Error(`Erro ao buscar histórico: ${result.error}`);
        }

        const messages = result.messages || [];
        const keywordLower = keyword.toLowerCase();
        const matches = [];
        let totalMessagesSearched = messages.length;

        console.log(`📊 Analisando ${messages.length} mensagens...`);

        // Processar mensagens
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const messageText = message.text || '';
            
            // Buscar palavra-chave na mensagem
            if (messageText.toLowerCase().includes(keywordLower)) {
                const match = {
                    message: message,
                    author: null,
                    timestamp: new Date(parseInt(message.ts) * 1000),
                    permalink: null,
                    context: []
                };

                // Buscar informações do autor
                if (message.user) {
                    try {
                        const userInfo = await slack.users.info({ user: message.user });
                        if (userInfo.ok) {
                            match.author = userInfo.user;
                        }
                    } catch (error) {
                        console.warn(`⚠️ Erro ao buscar usuário ${message.user}:`, error.message);
                    }
                }

                // Buscar link permanente
                try {
                    const permalink = await slack.chat.getPermalink({
                        channel: channelId,
                        message_ts: message.ts
                    });
                    if (permalink.ok) {
                        match.permalink = permalink.permalink;
                    }
                } catch (error) {
                    console.warn(`⚠️ Erro ao buscar permalink:`, error.message);
                }

                // Adicionar contexto (mensagens anteriores e posteriores)
                if (includeContext && contextSize > 0) {
                    const contextStart = Math.max(0, i - contextSize);
                    const contextEnd = Math.min(messages.length, i + contextSize + 1);
                    
                    for (let j = contextStart; j < contextEnd; j++) {
                        if (j !== i) {
                            const contextMsg = messages[j];
                            const contextAuthor = contextMsg.user ? 
                                await getUserInfo(contextMsg.user) : null;
                            
                            match.context.push({
                                message: contextMsg,
                                author: contextAuthor,
                                timestamp: new Date(parseInt(contextMsg.ts) * 1000),
                                isBefore: j < i
                            });
                        }
                    }
                }

                // Buscar em threads se habilitado
                if (searchInThreads && message.thread_ts) {
                    try {
                        const threadReplies = await slack.conversations.replies({
                            channel: channelId,
                            ts: message.thread_ts
                        });
                        
                        if (threadReplies.ok && threadReplies.messages) {
                            totalMessagesSearched += threadReplies.messages.length - 1; // -1 porque a primeira é a mensagem principal
                            
                            threadReplies.messages.forEach(reply => {
                                if (reply.text && reply.text.toLowerCase().includes(keywordLower)) {
                                    console.log(`🧵 Encontrado em thread: ${reply.text.substring(0, 50)}...`);
                                }
                            });
                        }
                    } catch (error) {
                        console.warn(`⚠️ Erro ao buscar thread:`, error.message);
                    }
                }

                matches.push(match);
            }
        }

        // Gerar estatísticas
        const summary = generateSummary(matches, keyword);
        
        const searchResult = {
            success: true,
            channel: channelId,
            keyword: keyword,
            totalMessagesSearched: totalMessagesSearched,
            matchesFound: matches.length,
            results: matches,
            summary: summary,
            searchOptions: options,
            timestamp: new Date()
        };

        // Salvar no cache
        cache.set(cacheKey, searchResult);
        
        console.log(`✅ Busca concluída: ${matches.length} resultados encontrados`);
        return searchResult;

    } catch (error) {
        console.error('❌ Erro na busca:', error);
        return {
            success: false,
            error: error.message,
            channel: channelId,
            keyword: keyword
        };
    }
}

/**
 * Função auxiliar para buscar informações do usuário
 */
async function getUserInfo(userId) {
    try {
        const userInfo = await slack.users.info({ user: userId });
        return userInfo.ok ? userInfo.user : null;
    } catch (error) {
        return null;
    }
}

/**
 * Gerar estatísticas dos resultados
 */
function generateSummary(matches, keyword) {
    const authorCounts = {};
    const timeDistribution = {};
    const wordFrequency = {};

    matches.forEach(match => {
        // Contar por autor
        if (match.author) {
            const authorName = match.author.real_name || match.author.name || 'Desconhecido';
            authorCounts[authorName] = (authorCounts[authorName] || 0) + 1;
        }

        // Distribuição por hora
        const hour = match.timestamp.getHours();
        timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;

        // Frequência de palavras
        const words = match.message.text.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3 && word !== keyword.toLowerCase()) {
                wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            }
        });
    });

    // Top contribuidores
    const topContributors = Object.entries(authorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([author, count]) => ({ author, count }));

    // Palavras mais frequentes
    const topWords = Object.entries(wordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));

    return {
        topContributors,
        topWords,
        timeDistribution,
        totalAuthors: Object.keys(authorCounts).length
    };
}

/**
 * Endpoint principal de busca
 */
app.post('/api/search', async (req, res) => {
    try {
        const { channelId, keyword, options = {} } = req.body;
        
        if (!channelId || !keyword) {
            return res.status(400).json({
                success: false,
                error: 'channelId e keyword são obrigatórios'
            });
        }

        const results = await searchChannelHistory(channelId, keyword, options);
        res.json(results);

    } catch (error) {
        console.error('❌ Erro no endpoint /api/search:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Endpoint para buscar em múltiplos canais
 */
app.post('/api/search/multiple', async (req, res) => {
    try {
        const { channelIds, keyword, options = {} } = req.body;
        
        if (!channelIds || !Array.isArray(channelIds) || !keyword) {
            return res.status(400).json({
                success: false,
                error: 'channelIds (array) e keyword são obrigatórios'
            });
        }

        const results = [];
        
        for (const channelId of channelIds) {
            console.log(`🔍 Buscando em ${channelId}...`);
            const result = await searchChannelHistory(channelId, keyword, options);
            results.push(result);
        }

        // Combinar resultados
        const combinedResults = {
            success: true,
            keyword: keyword,
            totalChannels: channelIds.length,
            results: results,
            summary: {
                totalMatches: results.reduce((sum, r) => sum + (r.matchesFound || 0), 0),
                totalMessagesSearched: results.reduce((sum, r) => sum + (r.totalMessagesSearched || 0), 0)
            }
        };

        res.json(combinedResults);

    } catch (error) {
        console.error('❌ Erro no endpoint /api/search/multiple:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Endpoint para estatísticas do canal
 */
app.get('/api/channel/:channelId/stats', async (req, res) => {
    try {
        const { channelId } = req.params;
        const { days = 30 } = req.query;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const oldest = Math.floor(startDate.getTime() / 1000);
        const latest = Math.floor(endDate.getTime() / 1000);

        const result = await slack.conversations.history({
            channel: channelId,
            oldest: oldest,
            latest: latest,
            limit: 1000
        });

        if (!result.ok) {
            throw new Error(`Erro ao buscar histórico: ${result.error}`);
        }

        const messages = result.messages || [];
        const stats = {
            channelId: channelId,
            period: { startDate, endDate, days: parseInt(days) },
            totalMessages: messages.length,
            uniqueUsers: new Set(messages.map(m => m.user).filter(Boolean)).size,
            averageMessagesPerDay: Math.round(messages.length / parseInt(days) * 10) / 10
        };

        res.json({
            success: true,
            stats: stats
        });

    } catch (error) {
        console.error('❌ Erro no endpoint /api/channel/:channelId/stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Interface web simples
 */
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Slack Search Agent</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; }
                input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
                button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background: #005a87; }
                .results { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 4px; }
                .error { color: red; }
                .success { color: green; }
            </style>
        </head>
        <body>
            <h1>🔍 Slack Search Agent</h1>
            <p>Busque mensagens em canais do Slack de forma inteligente e rápida.</p>
            
            <form id="searchForm">
                <div class="form-group">
                    <label for="channelId">ID do Canal:</label>
                    <input type="text" id="channelId" name="channelId" placeholder="C1234567890" required>
                </div>
                
                <div class="form-group">
                    <label for="keyword">Palavra-chave:</label>
                    <input type="text" id="keyword" name="keyword" placeholder="deploy, bug, reunião..." required>
                </div>
                
                <div class="form-group">
                    <label for="limit">Limite de mensagens:</label>
                    <select id="limit" name="limit">
                        <option value="100">100</option>
                        <option value="500" selected>500</option>
                        <option value="1000">1000</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="includeContext" name="includeContext" checked>
                        Incluir contexto das mensagens
                    </label>
                </div>
                
                <button type="submit">🔍 Buscar</button>
            </form>
            
            <div id="results" class="results" style="display: none;"></div>
            
            <script>
                document.getElementById('searchForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const formData = new FormData(e.target);
                    const data = {
                        channelId: formData.get('channelId'),
                        keyword: formData.get('keyword'),
                        options: {
                            limit: parseInt(formData.get('limit')),
                            includeContext: formData.get('includeContext') === 'on'
                        }
                    };
                    
                    const resultsDiv = document.getElementById('results');
                    resultsDiv.style.display = 'block';
                    resultsDiv.innerHTML = '<p>🔍 Buscando...</p>';
                    
                    try {
                        const response = await fetch('/api/search', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            resultsDiv.innerHTML = \`
                                <h3>✅ Resultados da Busca</h3>
                                <p><strong>Canal:</strong> \${result.channel}</p>
                                <p><strong>Palavra-chave:</strong> "\${result.keyword}"</p>
                                <p><strong>Mensagens analisadas:</strong> \${result.totalMessagesSearched}</p>
                                <p><strong>Resultados encontrados:</strong> \${result.matchesFound}</p>
                                
                                \${result.matchesFound > 0 ? \`
                                    <h4>📊 Estatísticas</h4>
                                    <p><strong>Top contribuidores:</strong></p>
                                    <ul>
                                        \${result.summary.topContributors.map(c => \`<li>\${c.author}: \${c.count} menções</li>\`).join('')}
                                    </ul>
                                    
                                    <h4>📝 Primeiros 5 resultados:</h4>
                                    \${result.results.slice(0, 5).map((r, i) => \`
                                        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                                            <strong>\${r.author?.real_name || 'Desconhecido'}</strong> 
                                            <small>(\${r.timestamp.toLocaleString()})</small><br>
                                            "\${r.message.text.substring(0, 150)}\${r.message.text.length > 150 ? '...' : ''}"
                                        </div>
                                    \`).join('')}
                                \` : '<p>Nenhum resultado encontrado.</p>'}
                            \`;
                        } else {
                            resultsDiv.innerHTML = \`<p class="error">❌ Erro: \${result.error}</p>\`;
                        }
                    } catch (error) {
                        resultsDiv.innerHTML = \`<p class="error">❌ Erro na requisição: \${error.message}</p>\`;
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Slack Search Agent rodando na porta ${port}`);
    console.log(`🌐 Interface web: http://localhost:${port}`);
    console.log(`🔍 API de busca: http://localhost:${port}/api/search`);
});

// Exportar função principal para uso em outros arquivos
module.exports = {
    searchChannelHistory,
    generateSummary
};

