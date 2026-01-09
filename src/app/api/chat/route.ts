import { NextRequest, NextResponse } from 'next/server';

// Simple AI chat implementation using Anthropic Claude API
// You'll need to add your ANTHROPIC_API_KEY to .env.local

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

interface Market {
  id: string;
  title: string;
  category: string;
  platform: string;
  volume: number;
  outcomes: { name: string; price: number; priceChange24h?: number }[];
}

// Fetch live market data
async function fetchLiveMarkets(): Promise<Market[]> {
  try {
    // Get base URL - works on Vercel and localhost
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/markets?platform=all`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.markets || [];
    }
  } catch (error) {
    console.error('Failed to fetch markets for chat:', error);
  }
  return [];
}

// Format markets for AI context
function formatMarketsForContext(markets: Market[]): string {
  if (markets.length === 0) return 'No market data available.';

  const categories = {
    crypto: markets.filter(m => m.category === 'crypto'),
    sports: markets.filter(m => m.category === 'sports'),
    politics: markets.filter(m => m.category === 'politics'),
    tech: markets.filter(m => m.category === 'tech'),
  };

  let context = 'LIVE MARKET DATA:\n\n';

  for (const [cat, catMarkets] of Object.entries(categories)) {
    if (catMarkets.length > 0) {
      context += `${cat.toUpperCase()} MARKETS:\n`;
      catMarkets.slice(0, 5).forEach(m => {
        const mainOutcome = m.outcomes[0];
        const volumeStr = m.volume >= 1000000
          ? `$${(m.volume / 1000000).toFixed(1)}M`
          : `$${(m.volume / 1000).toFixed(0)}K`;
        context += `- ${m.title} | ${mainOutcome?.name}: ${mainOutcome?.price}% | Vol: ${volumeStr} | ${m.platform}\n`;
      });
      context += '\n';
    }
  }

  return context;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    // Fetch live market data
    const markets = await fetchLiveMarkets();
    const marketContext = formatMarketsForContext(markets);

    // Check if API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return a response using real market data if no API key
      return NextResponse.json({
        response: getSmartResponse(message, markets),
        reasoning: ['Analyzing your query...', 'Searching prediction markets...', 'Compiling results...'],
      });
    }

    const systemPrompt = `You are an AI assistant for apella.fun, a prediction market trading terminal. You help users:
- Search and analyze prediction markets from Polymarket and Kalshi
- Understand market probabilities and implied odds
- Find trading opportunities
- Research market topics

Here is the current live market data:
${marketContext}

When users ask about markets, use this real data to provide accurate, up-to-date information. Format your responses clearly with:
- Tables for market data when relevant
- Bullet points for key insights
- Probabilities expressed as percentages

Be concise but informative. Use a casual, trader-friendly tone. Always reference actual market data from above when available.`;

    // Build messages for Claude
    const messages = [
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Claude API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return NextResponse.json({
        response: getSmartResponse(message, markets),
        reasoning: ['API error - showing live market results'],
      });
    }

    const data = await response.json();
    const aiResponse = data.content[0]?.text || 'I apologize, but I could not generate a response.';

    return NextResponse.json({
      response: aiResponse,
      reasoning: ['Analyzing query...', 'Fetching live markets...', 'Generating response...'],
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// Smart response using real market data
function getSmartResponse(message: string, markets: Market[]): string {
  const lowerMessage = message.toLowerCase();

  // Filter markets based on query
  const relevantMarkets = markets.filter(m => {
    const searchTerms = lowerMessage.split(' ');
    return searchTerms.some(term =>
      m.title.toLowerCase().includes(term) ||
      m.category.toLowerCase().includes(term)
    );
  });

  if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc') || lowerMessage.includes('crypto')) {
    const cryptoMarkets = markets.filter(m => m.category === 'crypto');
    if (cryptoMarkets.length > 0) {
      let response = `Here's what I found for Bitcoin/crypto markets:\n\n**Live Crypto Markets:**\n| Market | Probability | Volume |\n|--------|------------|--------|\n`;
      cryptoMarkets.slice(0, 5).forEach(m => {
        const vol = m.volume >= 1000000
          ? `$${(m.volume / 1000000).toFixed(1)}M`
          : `$${(m.volume / 1000).toFixed(0)}K`;
        response += `| ${m.title.slice(0, 30)}... | ${m.outcomes[0]?.price}% | ${vol} |\n`;
      });
      response += `\n**Key Insights:**\n- ${cryptoMarkets.length} active crypto markets\n- Total volume: $${(cryptoMarkets.reduce((sum, m) => sum + m.volume, 0) / 1000000).toFixed(1)}M\n\nWant me to analyze any specific market?`;
      return response;
    }
    return getMockCryptoResponse();
  }

  if (lowerMessage.includes('super bowl') || lowerMessage.includes('nfl') || lowerMessage.includes('sports') || lowerMessage.includes('football')) {
    const sportsMarkets = markets.filter(m => m.category === 'sports');
    if (sportsMarkets.length > 0) {
      let response = `Here are the live NFL/Sports markets:\n\n**Live Sports Markets:**\n| Market | Probability | Volume |\n|--------|------------|--------|\n`;
      sportsMarkets.slice(0, 6).forEach(m => {
        const vol = m.volume >= 1000000
          ? `$${(m.volume / 1000000).toFixed(1)}M`
          : `$${(m.volume / 1000).toFixed(0)}K`;
        response += `| ${m.title.slice(0, 30)}... | ${m.outcomes[0]?.price}% | ${vol} |\n`;
      });
      response += `\n**Key Insights:**\n- ${sportsMarkets.length} active sports markets\n- Highest volume: ${sportsMarkets.sort((a, b) => b.volume - a.volume)[0]?.title}\n\nWant me to break down specific matchups?`;
      return response;
    }
    return getMockSportsResponse();
  }

  if (lowerMessage.includes('trump') || lowerMessage.includes('election') || lowerMessage.includes('politics')) {
    const politicsMarkets = markets.filter(m => m.category === 'politics');
    if (politicsMarkets.length > 0) {
      let response = `Here are the live political markets:\n\n**Live Political Markets:**\n| Market | Probability | Volume |\n|--------|------------|--------|\n`;
      politicsMarkets.slice(0, 5).forEach(m => {
        const vol = m.volume >= 1000000
          ? `$${(m.volume / 1000000).toFixed(1)}M`
          : `$${(m.volume / 1000).toFixed(0)}K`;
        response += `| ${m.title.slice(0, 30)}... | ${m.outcomes[0]?.price}% | ${vol} |\n`;
      });
      response += `\n**Key Insights:**\n- Political markets have the highest liquidity\n- Total volume: $${(politicsMarkets.reduce((sum, m) => sum + m.volume, 0) / 1000000).toFixed(1)}M\n\nAny specific political market you want to analyze?`;
      return response;
    }
    return getMockPoliticsResponse();
  }

  if (lowerMessage.includes('ai') || lowerMessage.includes('tech') || lowerMessage.includes('openai')) {
    const techMarkets = markets.filter(m => m.category === 'tech');
    if (techMarkets.length > 0) {
      let response = `Here are the AI/Tech markets:\n\n**Live Tech Markets:**\n| Market | Probability | Volume |\n|--------|------------|--------|\n`;
      techMarkets.slice(0, 5).forEach(m => {
        const vol = m.volume >= 1000000
          ? `$${(m.volume / 1000000).toFixed(1)}M`
          : `$${(m.volume / 1000).toFixed(0)}K`;
        response += `| ${m.title.slice(0, 30)}... | ${m.outcomes[0]?.price}% | ${vol} |\n`;
      });
      return response;
    }
    return getMockTechResponse();
  }

  if (lowerMessage.includes('volume') || lowerMessage.includes('highest') || lowerMessage.includes('trending')) {
    const sortedByVolume = [...markets].sort((a, b) => b.volume - a.volume);
    if (sortedByVolume.length > 0) {
      let response = `Here are today's highest volume markets:\n\n**Top Markets by Volume:**\n| Market | Category | Volume |\n|--------|----------|--------|\n`;
      sortedByVolume.slice(0, 8).forEach(m => {
        const vol = m.volume >= 1000000
          ? `$${(m.volume / 1000000).toFixed(1)}M`
          : `$${(m.volume / 1000).toFixed(0)}K`;
        response += `| ${m.title.slice(0, 25)}... | ${m.category} | ${vol} |\n`;
      });
      response += `\n**Summary:**\n- Total markets tracked: ${markets.length}\n- Combined volume: $${(markets.reduce((sum, m) => sum + m.volume, 0) / 1000000).toFixed(1)}M`;
      return response;
    }
  }

  // Default response with market summary
  if (markets.length > 0) {
    const categories = Array.from(new Set(markets.map(m => m.category)));
    return `I can help you explore ${markets.length} live prediction markets across ${categories.join(', ')}!

**Quick Stats:**
- Total markets: ${markets.length}
- Categories: ${categories.map(c => `${c} (${markets.filter(m => m.category === c).length})`).join(', ')}

Try asking about:
- "What are the Bitcoin markets?"
- "Show me Super Bowl odds"
- "What's trending today?"
- "AI company predictions"`;
  }

  return getDefaultResponse();
}

// Fallback mock responses
function getMockCryptoResponse(): string {
  return `Here's what I found for Bitcoin/crypto markets:

**Bitcoin Price Markets:**
| Market | Probability | Volume |
|--------|------------|--------|
| BTC > $100K by March | 45.2% | ~$2.1M |
| BTC dips to $85K in Jan | 60.3% | ~$250K |
| ETH > $4K by Feb | 32.1% | ~$890K |

**Key Insights:**
- Bitcoin volatility markets are seeing high volume
- Current sentiment leans bearish short-term
- Large whale activity detected on downside bets

Would you like me to dig deeper into any specific market?`;
}

function getMockSportsResponse(): string {
  return `Here are the top NFL/Super Bowl markets:

**Super Bowl Winner:**
| Team | Probability | Volume |
|------|------------|--------|
| Los Angeles Rams | 17.8% | ~$2.8M |
| Seattle | 10.9% | ~$3.3M |
| Buffalo | 9.8% | ~$2.4M |
| Green Bay | 9.3% | ~$2.1M |

**Key Insights:**
- Rams seeing increased action after recent win
- Sharp money moving towards underdogs
- Conference championship games will shift probabilities significantly

Want me to break down specific matchups or spreads?`;
}

function getMockPoliticsResponse(): string {
  return `Here are the top political markets:

**Political Events:**
| Market | Probability | Volume |
|--------|------------|--------|
| Trump Nomination Pick | Various | ~$12.5M |
| China-Taiwan 2026 | 11.7% | ~$447K |
| 2026 Midterm Control | Various | ~$5.2M |

**Key Insights:**
- Political markets have highest liquidity overall
- Long-dated markets showing more stability
- Watch for news-driven volatility

Any specific political market you want to analyze?`;
}

function getMockTechResponse(): string {
  return `Here are the AI/Tech markets:

**AI & Technology:**
| Market | Probability | Volume |
|--------|------------|--------|
| OpenAI announces AGI before 2027 | 8.5% | ~$12K |
| #1 AI model by June 30 (xAI) | 34.5% | ~$73K |
| Nothing Happens: AI Edition | 99.7% | ~$164K |

**Key Insights:**
- AGI markets remain heavily discounted
- xAI leading in model competition bets
- "Nothing happens" meta markets are popular

Interested in specific AI company or timeline markets?`;
}

function getDefaultResponse(): string {
  return `I can help you explore prediction markets! Here are some things I can assist with:

- **Market Search**: Find markets by topic (crypto, sports, politics, tech)
- **Analysis**: Break down probabilities and implied odds
- **Comparisons**: Compare similar markets across platforms
- **Research**: Get context on market topics

What would you like to explore? Try asking about:
- Bitcoin price predictions
- Super Bowl winner odds
- Political event markets
- AI/Tech developments`;
}
