const { WebClient } = require('@slack/web-api');

/**
 * Classe utilitária para funcionalidades avançadas do Slack Search Agent
 */
class SlackSearchAgent {
    constructor(token) {
        this.client = new WebClient(token);
        this.cache = new Map();
    }

    /**
     * Buscar em múltiplos canais simultaneamente
     */
    async searchMultipleChannels(channelIds, keyword, options = {}) {
        const results = [];
        
        console.log(`🔍 Iniciando busca em ${channelIds.length} canais...`);
        
        for (const channelId of channelIds) {
            console.log(`📺 Buscando em ${channelId}...`);
            try {
                const result = await this.searchChannel(channelId, keyword, options);
                results.push(result);
                
                // Delay para evitar rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`❌ Erro ao buscar em ${channelId}:`, error.message);
                results.push({
                    success: false,
                    channel: channelId,
                    error: error.message
                });
            }
        }
        
        return this.combineResults(results, keyword);
    }

    /**
     * Buscar com múltiplas palavras-chave
     */
    async searchMultipleKeywords(channelId, keywords, options = {}) {
        const results = {};
        
        console.log(`🔍 Iniciando busca por ${keywords.length} palavras-chave...`);
        
        for (const keyword of keywords) {
            console.log(`📝 Buscando por "${keyword}"...`);
            try {
                results[keyword] = await this.searchChannel(channelId, keyword, options);
                
                // Delay para evitar rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`❌ Erro ao buscar por "${keyword}":`, error.message);
                results[keyword] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        return results;
    }

    /**
     * Buscar em período específico
     */
    async searchInTimeRange(channelId, keyword, startDate, endDate, options = {}) {
        const oldest = Math.floor(startDate.getTime() / 1000);
        const latest = Math.floor(endDate.getTime() / 1000);
        
        console.log(`📅 Buscando por "${keyword}" entre ${startDate.toLocaleDateString()} e ${endDate.toLocaleDateString()}`);
        
        try {
            const result = await this.client.conversations.history({
                channel: channelId,
                oldest: oldest,
                latest: latest,
                limit: options.limit || 1000
            });
            
            if (!result.ok) {
                throw new Error(`Erro ao buscar histórico: ${result.error}`);
            }
            
            const messages = result.messages || [];
            const keywordLower = keyword.toLowerCase();
            
            const matches = messages.filter(msg => 
                msg.text?.toLowerCase().includes(keywordLower)
            );
            
            return {
                success: true,
                channel: channelId,
                keyword: keyword,
                period: { startDate, endDate },
                totalMessages: messages.length,
                matchesFound: matches.length,
                results: matches
            };
            
        } catch (error) {
            console.error('❌ Erro na busca por período:', error);
            return {
                success: false,
                error: error.message,
                channel: channelId,
                keyword: keyword
            };
        }
    }

    /**
     * Buscar por padrões regex
     */
    async searchByPattern(channelId, pattern, options = {}) {
        try {
            const regex = new RegExp(pattern, options.caseSensitive ? '' : 'i');
            
            const result = await this.client.conversations.history({
                channel: channelId,
                limit: options.limit || 1000
            });
            
            if (!result.ok) {
                throw new Error(`Erro ao buscar histórico: ${result.error}`);
            }
            
            const messages = result.messages || [];
            const matches = messages.filter(msg => 
                regex.test(msg.text || '')
            );
            
            return {
                success: true,
                channel: channelId,
                pattern: pattern,
                totalMessages: messages.length,
                matchesFound: matches.length,
                results: matches
            };
            
        } catch (error) {
            console.error('❌ Erro na busca por padrão:', error);
            return {
                success: false,
                error: error.message,
                channel: channelId,
                pattern: pattern
            };
        }
    }

    /**
     * Exportar resultados para CSV
     */
    exportToCSV(results) {
        if (!results.success || !results.results) {
            throw new Error('Resultados inválidos para exportação');
        }
        
        const headers = 'Timestamp,Author,Message,Channel,Link\n';
        const rows = results.results.map(r => {
            const timestamp = new Date(parseInt(r.ts) * 1000).toISOString();
            const author = r.user || 'Desconhecido';
            const msg = (r.text || '').replace(/"/g, '""').replace(/\n/g, ' ');
            const channel = results.channel;
            const link = r.permalink || '';
            
            return `"${timestamp}","${author}","${msg}","${channel}","${link}"`;
        }).join('\n');
        
        return headers + rows;
    }

    /**
     * Exportar resultados para JSON
     */
    exportToJSON(results) {
        return JSON.stringify(results, null, 2);
    }

    /**
     * Análise de sentimento simples
     */
    analyzeSentiment(text) {
        const positive = ['ótimo', 'bom', 'excelente', 'perfeito', 'sucesso', 'parabéns', 'legal', 'incrível', 'fantástico'];
        const negative = ['problema', 'erro', 'falha', 'bug', 'quebrou', 'ruim', 'terrível', 'horrível', 'péssimo'];
        const neutral = ['ok', 'certo', 'entendi', 'claro', 'sim', 'não'];
        
        const textLower = text.toLowerCase();
        let score = 0;
        let wordCount = 0;
        
        positive.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) {
                score += matches.length;
                wordCount += matches.length;
            }
        });
        
        negative.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) {
                score -= matches.length;
                wordCount += matches.length;
            }
        });
        
        neutral.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) {
                wordCount += matches.length;
            }
        });
        
        let sentiment = 'neutral';
        if (score > 0) sentiment = 'positive';
        else if (score < 0) sentiment = 'negative';
        
        return {
            score: score,
            sentiment: sentiment,
            confidence: wordCount > 0 ? Math.abs(score) / wordCount : 0,
            wordCount: wordCount
        };
    }

    /**
     * Análise de frequência de palavras
     */
    analyzeWordFrequency(text, excludeWords = []) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => 
                word.length > 2 && 
                !excludeWords.includes(word) &&
                !['de', 'da', 'do', 'em', 'na', 'no', 'para', 'com', 'por', 'que', 'uma', 'um', 'é', 'são'].includes(word)
            );
        
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        
        return Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20)
            .map(([word, count]) => ({ word, count }));
    }

    /**
     * Buscar usuários ativos no canal
     */
    async getActiveUsers(channelId, days = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const oldest = Math.floor(startDate.getTime() / 1000);
            const latest = Math.floor(endDate.getTime() / 1000);
            
            const result = await this.client.conversations.history({
                channel: channelId,
                oldest: oldest,
                latest: latest,
                limit: 1000
            });
            
            if (!result.ok) {
                throw new Error(`Erro ao buscar histórico: ${result.error}`);
            }
            
            const messages = result.messages || [];
            const userCounts = {};
            
            messages.forEach(msg => {
                if (msg.user) {
                    userCounts[msg.user] = (userCounts[msg.user] || 0) + 1;
                }
            });
            
            // Buscar informações dos usuários
            const activeUsers = [];
            for (const [userId, count] of Object.entries(userCounts)) {
                try {
                    const userInfo = await this.client.users.info({ user: userId });
                    if (userInfo.ok) {
                        activeUsers.push({
                            id: userId,
                            name: userInfo.user.real_name || userInfo.user.name,
                            messageCount: count,
                            isBot: userInfo.user.is_bot || false
                        });
                    }
                } catch (error) {
                    console.warn(`⚠️ Erro ao buscar usuário ${userId}:`, error.message);
                }
            }
            
            return activeUsers.sort((a, b) => b.messageCount - a.messageCount);
            
        } catch (error) {
            console.error('❌ Erro ao buscar usuários ativos:', error);
            return [];
        }
    }

    /**
     * Combinar resultados de múltiplos canais
     */
    combineResults(results, keyword) {
        const successfulResults = results.filter(r => r.success);
        const failedResults = results.filter(r => !r.success);
        
        const totalMatches = successfulResults.reduce((sum, r) => sum + (r.matchesFound || 0), 0);
        const totalMessages = successfulResults.reduce((sum, r) => sum + (r.totalMessagesSearched || 0), 0);
        
        // Combinar todos os resultados em uma lista
        const allResults = successfulResults.reduce((acc, r) => {
            if (r.results) {
                acc.push(...r.results.map(result => ({
                    ...result,
                    sourceChannel: r.channel
                })));
            }
            return acc;
        }, []);
        
        // Ordenar por timestamp (mais recente primeiro)
        allResults.sort((a, b) => {
            const timeA = a.ts ? parseInt(a.ts) : 0;
            const timeB = b.ts ? parseInt(b.ts) : 0;
            return timeB - timeA;
        });
        
        return {
            success: true,
            keyword: keyword,
            totalChannels: results.length,
            successfulChannels: successfulResults.length,
            failedChannels: failedResults.length,
            totalMatches: totalMatches,
            totalMessagesSearched: totalMessages,
            results: allResults,
            channelResults: results,
            timestamp: new Date()
        };
    }

    /**
     * Buscar canais disponíveis
     */
    async getAvailableChannels() {
        try {
            const result = await this.client.conversations.list({
                types: 'public_channel,private_channel',
                limit: 1000
            });
            
            if (!result.ok) {
                throw new Error(`Erro ao listar canais: ${result.error}`);
            }
            
            return result.channels.map(channel => ({
                id: channel.id,
                name: channel.name,
                isPrivate: channel.is_private,
                memberCount: channel.num_members,
                isMember: channel.is_member
            }));
            
        } catch (error) {
            console.error('❌ Erro ao buscar canais:', error);
            return [];
        }
    }
}

module.exports = SlackSearchAgent;

