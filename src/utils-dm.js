const { WebClient } = require('@slack/web-api');

class DMSearchBot {
    constructor(token) {
        this.client = new WebClient(token);
        this.searchHistory = new Map(); // Histórico de buscas por usuário
    }

    // Salva o histórico de busca do usuário
    saveSearch(userId, channel, keyword, results) {
        if (!this.searchHistory.has(userId)) {
            this.searchHistory.set(userId, []);
        }
        
        const userHistory = this.searchHistory.get(userId);
        userHistory.push({
            timestamp: new Date(),
            channel,
            keyword,
            resultCount: results.length
        });
        
        // Manter apenas as últimas 10 buscas
        if (userHistory.length > 10) {
            userHistory.shift();
        }
    }

    // Obtém o histórico de busca do usuário
    getUserHistory(userId) {
        return this.searchHistory.get(userId) || [];
    }

    // Processa comandos especiais
    async handleSpecialCommands(text, userId) {
        const command = text.toLowerCase().trim();
        
        switch (command) {
            case 'history':
                const history = this.getUserHistory(userId);
                if (history.length === 0) {
                    return "📝 Você ainda não fez nenhuma busca.";
                }
                
                let historyText = "📝 Suas últimas buscas:\n";
                history.forEach((search, index) => {
                    const time = search.timestamp.toLocaleString('pt-BR');
                    historyText += `${index + 1}. \`${search.keyword}\` em #${search.channel} (${time}) - ${search.resultCount} resultados\n`;
                });
                return historyText;
                
                               case 'help':
                       return `🤖 *Comandos disponíveis:*
                       
🔍 *Busca:*
 • \`search #canal palavra\` - Busca por palavra no canal
 • \`search #canal "frase exata"\` - Busca por frase exata

📊 *Informações:*
 • \`history\` - Mostra seu histórico de buscas
 • \`stats #canal\` - Estatísticas do canal
 • \`help\` - Esta mensagem de ajuda

💡 *Dicas:*
 • Digite apenas \`search\` para ver como usar
 • Use aspas para frases exatas: \`search #general "hello world"\`
 • Digite \`oi\` ou \`hello\` para uma mensagem de boas-vindas

*Exemplos:*
 • \`search #general teste\`
 • \`search #random "hello world"\`
 • \`stats #general\``;
                
            case 'stats':
                return "📊 Funcionalidade de estatísticas em desenvolvimento...";
                
            default:
                return null; // Não é um comando especial
        }
    }

    // Obtém estatísticas básicas do canal
    async getChannelStats(channelName) {
        try {
            const channel = await this.client.conversations.list();
            const targetChannel = channel.channels.find(c => c.name === channelName);
            
            if (!targetChannel) {
                return `❌ Canal #${channelName} não encontrado.`;
            }
            
            const stats = await this.client.conversations.info({
                channel: targetChannel.id
            });
            
            return `📊 *Estatísticas do canal #${channelName}:*
• Membros: ${stats.channel.num_members}
• Criado em: ${new Date(stats.channel.created * 1000).toLocaleDateString('pt-BR')}
• Tópico: ${stats.channel.topic?.value || 'Nenhum tópico definido'}`;
            
        } catch (error) {
            return `❌ Erro ao obter estatísticas: ${error.message}`;
        }
    }

    // Busca avançada com filtros
    async advancedSearch(channel, options = {}) {
        // Placeholder para funcionalidades avançadas
        // Pode incluir filtros por data, usuário, tipo de mensagem, etc.
        return "🔍 Funcionalidade de busca avançada em desenvolvimento...";
    }

    // Formata exportação dos resultados
    formatExport(results, format = 'text') {
        switch (format) {
            case 'csv':
                // Implementar exportação CSV
                return "📄 Exportação CSV em desenvolvimento...";
            case 'json':
                // Implementar exportação JSON
                return "📄 Exportação JSON em desenvolvimento...";
            default:
                return "📄 Formato de exportação não suportado.";
        }
    }
}

module.exports = DMSearchBot;
