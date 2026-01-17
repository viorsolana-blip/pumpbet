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

interface KOLBet {
  id: string;
  kolName: string;
  kolTicker: string;
  kolTwitter?: string;
  title: string;
  description: string;
  category: string;
  endTime: string;
  yesPool: number;
  noPool: number;
  isLive: boolean;
}

// KOL profiles - who they are and their reputation
const KOL_PROFILES: Record<string, { bio: string; reputation: string; style: string }> = {
  'Alon': {
    bio: 'Solana degen and content creator. Known for high-conviction plays and deep alpha.',
    reputation: 'Solid track record, his calls often 3-5x. Quiet periods followed by bangers.',
    style: 'Posts main tweets sparingly but when he does, pay attention.',
  },
  'White Whale': {
    bio: 'Legendary whale trader on Solana. $WHALE token holder community.',
    reputation: 'One of the biggest wallets in the ecosystem. Smart money follows him.',
    style: 'Accumulates quietly, then pumps hard. Market cap targets are ambitious.',
  },
  'Cented': {
    bio: 'Twitter: @cikifriki_sol. Rising KOL with growing community. Content machine.',
    reputation: 'Fast growing following, engagement is real. Good at spotting early plays.',
    style: 'Posts frequently, builds community through consistency.',
  },
  'Orangie': {
    bio: 'Orangie Web3 - YouTube content creator covering Solana ecosystem.',
    reputation: 'Educational content, brings normies into the space. Reliable posting schedule.',
    style: 'Video-focused, tends to batch content. Quality over quantity.',
  },
  'Leck': {
    bio: 'Top trader on KOLscan leaderboards. Known for consistent PNL.',
    reputation: 'Regularly finishes top 10-20 on monthly leaderboards. Disciplined trader.',
    style: 'Takes calculated risks, not a gambler. Steady gains over moonshots.',
  },
  'Cupsey': {
    bio: 'High-volume trader targeting big PNL numbers.',
    reputation: 'Goes for home runs. Can have big wins or losses. High risk, high reward.',
    style: 'Aggressive trading style, leverages often.',
  },
  'Bitcoin': {
    bio: 'The OG. Digital gold. $BTC.',
    reputation: 'King of crypto. Everything follows BTC.',
    style: 'Macro asset, watch for ETF flows and institutional moves.',
  },
  'Dingaling': {
    bio: 'NFT and crypto influencer with massive following.',
    reputation: 'OG in the space, been around since early NFT days.',
    style: 'Diversified across NFTs and tokens. Community builder.',
  },
};

// Fetch live market data
async function fetchLiveMarkets(): Promise<Market[]> {
  try {
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

// Fetch KOL bets
async function fetchKOLBets(): Promise<KOLBet[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/bets?status=active`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const data = await response.json();
      return data.bets || [];
    }
  } catch (error) {
    console.error('Failed to fetch KOL bets for chat:', error);
  }
  return [];
}

// Format KOL bets for AI context
function formatKOLBetsForContext(bets: KOLBet[]): string {
  if (bets.length === 0) return 'No KOL bets available.';

  let context = 'ACTIVE KOL BETS ON PUMPBET:\n\n';

  bets.forEach(bet => {
    const totalPool = bet.yesPool + bet.noPool;
    const yesPercent = totalPool > 0 ? ((bet.yesPool / totalPool) * 100).toFixed(0) : '50';
    const noPercent = totalPool > 0 ? ((bet.noPool / totalPool) * 100).toFixed(0) : '50';
    const endDate = new Date(bet.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const profile = KOL_PROFILES[bet.kolName];

    context += `**${bet.kolName}** (${bet.kolTicker})${bet.kolTwitter ? ` - ${bet.kolTwitter}` : ''}\n`;
    context += `  Bet: "${bet.description}"\n`;
    context += `  Odds: Yes ${yesPercent}% / No ${noPercent}% | Pool: ${totalPool.toFixed(1)} SOL | Ends: ${endDate}\n`;
    if (profile) {
      context += `  Who: ${profile.bio}\n`;
      context += `  Rep: ${profile.reputation}\n`;
    }
    context += '\n';
  });

  return context;
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

    // Fetch live market data and KOL bets
    const [markets, kolBets] = await Promise.all([
      fetchLiveMarkets(),
      fetchKOLBets(),
    ]);
    const marketContext = formatMarketsForContext(markets);
    const kolContext = formatKOLBetsForContext(kolBets);

    // Check if API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Return a response using real market data if no API key
      return NextResponse.json({
        response: getSmartResponse(message, markets, kolBets),
        reasoning: ['Analyzing your query...', 'Searching prediction markets...', 'Compiling results...'],
      });
    }

    const systemPrompt = `You are the PumpBet Trench Assistant - an advanced AI trading companion built for Solana memecoin degens and prediction market traders. You provide actionable intelligence based on:
- Real-time KOL activity, track records, and wallet patterns
- Token sentiment, momentum indicators, and whale movements
- Cross-platform arbitrage opportunities (Polymarket, Kalshi, PumpBet)
- Smart money signals and market microstructure

PERSONALITY: You're a seasoned trench veteran who's seen it all - rugs, moonshots, and everything in between. You speak naturally with degen slang when appropriate (ape, ngmi, wagmi, ser, anon, rugged, pumping, based, fading, etc.) but you're also highly analytical. You give DIRECT, ACTIONABLE recommendations - never hedge unnecessarily.

CURRENT PUMPBET DATA:
${kolContext}

POLYMARKET/KALSHI LIVE MARKETS:
${marketContext}

YOUR CAPABILITIES:
1. **MARKET ANALYSIS**: Deep dive into any market - probability assessment, implied odds, historical patterns, volume analysis
2. **KOL INTELLIGENCE**: Track record analysis, wallet watching, content patterns, reliability scoring
3. **BETTING RECOMMENDATIONS**: Clear Yes/No calls with confidence %, expected value calculations, risk assessment
4. **ALPHA HUNTING**: Spot mispriced markets, arbitrage opportunities, early signals
5. **RISK MANAGEMENT**: Position sizing advice, diversification, hedging strategies
6. **TREND DETECTION**: What's heating up, what's fading, where smart money is flowing

KOL DEEP PROFILES:
- **Alon** (@aaborsh): Silent assassin. Posts maybe 1-2x/week but when he does, PAY ATTENTION. Last 6 calls: 5 winners, avg 3.8x. Wallet shows accumulation before tweets.
- **White Whale**: The OG whale. $WHALE community. Market cap targets seem crazy until they hit. His bags are DEEP - can move markets solo.
- **Cented** (@cikifriki_sol): The grinder. Posts 5-10x daily. Engagement is organic, growing fast. Good at finding microcaps before they run.
- **Orangie** (Orangie Web3): YouTube educator. Batches content weekly. Brings retail flow - his picks pump on video release.
- **Leck**: The consistent one. KOLscan top 10-20 every month. Doesn't swing for fences but rarely misses. Risk-adjusted returns are elite.
- **Cupsey**: The gambler. Goes for 10x+ plays. Big wins, big losses. Volatility trader - ride with small size or fade when overextended.
- **Dingaling**: OG from NFT days. Massive following. When he tweets a token, expect volume spike within minutes.

RESPONSE GUIDELINES:
- Be CONCISE but COMPLETE - no fluff, all signal
- Use clear betting format: **BET: YES/NO** (Confidence: X%) - Reason in one line
- Include expected value when relevant: "EV: +12% at current odds"
- Flag risks explicitly: "⚠️ Risk: [specific risk]"
- Add alpha at the end when you have unique insight
- Use markdown formatting for readability
- If asked about something you don't have data on, say so directly and suggest alternatives

EXAMPLE RESPONSES:
User: "Should I bet on Alon posting 3 tweets this week?"
Response: "Ser, Alon's been radio silent for 8 days - historically that means he's cooking something. His wallet shows 3 new positions opened. **BET: YES** (Confidence: 72%) - Pattern matches his pre-tweet accumulation phase. ⚠️ Risk: Vacation could extend silence. Alpha: Watch for retweets first, usually precedes original content by 24-48h."

User: "What's the best bet on PumpBet right now?"
Response: "Looking at current odds vs track records, here's my ranking:
1. **Leck $100k PNL** - Yes @ 67% is UNDERPRICED. He's hit $80k already, pace puts him at $120k+ by EOW. **BET: YES** (85% confidence)
2. **White Whale 500M mcap** - Ambitious but he has the wallet to pump it there. **BET: YES** (55% confidence) - high risk/reward
⚠️ Avoid: Cupsey's bet - variance too high at current odds, negative EV."`;


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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
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
function getSmartResponse(message: string, markets: Market[], kolBets: KOLBet[] = []): string {
  const lowerMessage = message.toLowerCase();

  // Check for KOL-specific queries first
  const kolNames = ['alon', 'whale', 'white whale', 'cented', 'orangie', 'leck', 'cupsey', 'dingaling'];
  const mentionedKol = kolNames.find(name => lowerMessage.includes(name));

  if (mentionedKol || lowerMessage.includes('kol') || lowerMessage.includes('trench')) {
    return getKOLResponse(lowerMessage, kolBets, mentionedKol);
  }

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

// KOL-specific response
function getKOLResponse(message: string, kolBets: KOLBet[], mentionedKol?: string): string {
  // If asking about a specific KOL
  if (mentionedKol) {
    const kolBet = kolBets.find(b => b.kolName.toLowerCase().includes(mentionedKol) ||
                                     (mentionedKol === 'whale' && b.kolName === 'White Whale'));
    const profile = Object.entries(KOL_PROFILES).find(([name]) =>
      name.toLowerCase().includes(mentionedKol) ||
      (mentionedKol === 'whale' && name === 'White Whale')
    );

    if (kolBet && profile) {
      const [kolName, kolInfo] = profile;
      const totalPool = kolBet.yesPool + kolBet.noPool;
      const yesPercent = totalPool > 0 ? ((kolBet.yesPool / totalPool) * 100).toFixed(0) : '50';
      const endDate = new Date(kolBet.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return `**${kolName}** (${kolBet.kolTicker})${kolBet.kolTwitter ? ` - ${kolBet.kolTwitter}` : ''}

**Who is ${kolName}?**
${kolInfo.bio}

**Reputation:** ${kolInfo.reputation}

**Style:** ${kolInfo.style}

---

**Active Bet:** "${kolBet.description}"
- **Yes:** ${yesPercent}% | **No:** ${(100 - parseFloat(yesPercent)).toFixed(0)}%
- **Pool:** ${totalPool.toFixed(1)} SOL
- **Ends:** ${endDate}

**My Take:** Based on ${kolName}'s track record, ${parseFloat(yesPercent) > 50 ? 'the market is leaning Yes' : 'the market is skeptical'}. ${kolInfo.reputation}

Want me to give you a betting recommendation?`;
    }
  }

  // General KOL/trench bets overview
  if (kolBets.length > 0) {
    let response = `**🔥 Active Trench Bets on PumpBet:**\n\n`;

    kolBets.forEach(bet => {
      const totalPool = bet.yesPool + bet.noPool;
      const yesPercent = totalPool > 0 ? ((bet.yesPool / totalPool) * 100).toFixed(0) : '50';
      const endDate = new Date(bet.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      response += `**${bet.kolName}** (${bet.kolTicker})\n`;
      response += `└ ${bet.description}\n`;
      response += `└ Yes ${yesPercent}% / No ${(100 - parseFloat(yesPercent)).toFixed(0)}% | ${totalPool.toFixed(1)} SOL | Ends ${endDate}\n\n`;
    });

    response += `---\n\n**Ask me about any KOL** for detailed analysis and betting recommendations!\n`;
    response += `Try: "Tell me about Alon" or "Should I bet on Leck?"`;

    return response;
  }

  return `I can help you with KOL bets on PumpBet! Here are the KOLs we track:

- **Alon** (@aaborsh) - Quiet alpha hunter, 3-5x track record
- **White Whale** - Legendary whale trader, $WHALE token
- **Cented** (@cikifriki_sol) - Rising star, growing fast
- **Orangie** - YouTube content creator
- **Leck** - Top KOLscan trader, consistent PNL
- **Cupsey** - High-risk, high-reward trader
- **Dingaling** - OG NFT/crypto influencer

Ask me about any of them for betting recommendations!`;
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
