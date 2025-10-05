import { tavily } from "@tavily/core";

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  source: string;
  displayLink: string;
  score?: number;
}

export class WebSearchService {
  private tvly: any;

  constructor() {
    // Initialize Tavily client
    const apiKey = process.env.TAVILY_API_KEY;
    console.log('🔑 Tavily API Key status:', apiKey ? `Set (${apiKey.substring(0, 10)}...)` : 'NOT SET')
    if (apiKey) {
      this.tvly = tavily({ apiKey });
      console.log('✅ Tavily client initialized successfully')
    } else {
      console.error('❌ TAVILY_API_KEY not found in environment variables')
    }
  }

  async searchWeb(query: string) {
    try {
      // Check if API key is configured
      if (!this.tvly) {
        console.log('Tavily API not configured')
        return [{
          title: "Search Unavailable",
          snippet: "Web search is currently unavailable. Please configure Tavily API key in your environment variables.",
          link: "#",
          source: "plounix.ai",
          displayLink: "Setup Required"
        }]
      }

      // Using Tavily AI Search API (1000 searches/month free)
      const response = await this.tvly.search(query, {
        searchDepth: "advanced",
        maxResults: 5,
        includeAnswer: false,
        includeRawContent: false
      });
      
      if (response.results && response.results.length > 0) {
        return response.results.map((item: any) => ({
          title: item.title,
          snippet: item.content,
          link: item.url,
          source: this.extractDomain(item.url),
          displayLink: this.extractDomain(item.url),
          score: item.score
        }))
      }
      return []
    } catch (error) {
      console.error('Tavily Search failed:', error)
      return []
    }
  }

  async getCurrentPrice(item: string) {
    const query = `${item} price Philippines 2024 buy online cost Lazada Shopee`
    const results = await this.searchWeb(query)
    
    // Filter for shopping/price-related sites
    const priceResults = results.filter((result: SearchResult) => 
      result.source.includes('lazada') || 
      result.source.includes('shopee') || 
      result.source.includes('price') ||
      result.snippet.toLowerCase().includes('₱') ||
      result.snippet.toLowerCase().includes('peso')
    )
    
    return priceResults.slice(0, 3)
  }

  async getBankRates() {
    const query = "Philippines bank interest rates 2024 CIMB ING Tonik Maya digital bank current"
    const results = await this.searchWeb(query)
    
    // Filter for financial sites
    return results.filter((result: SearchResult) => 
      result.source.includes('bsp.gov.ph') ||
      result.source.includes('bank') ||
      result.source.includes('financial') ||
      result.snippet.toLowerCase().includes('interest rate')
    ).slice(0, 3)
  }

  async searchSpecificSite(site: string, query: string) {
    const searchQuery = `site:${site} ${query}`
    return await this.searchWeb(searchQuery)
  }

  async searchFinancialNews() {
    const query = "Philippines financial news BSP banking investment 2024"
    const results = await this.searchWeb(query)
    
    // Filter for news and financial sites
    return results.filter((result: SearchResult) => 
      result.source.includes('news') ||
      result.source.includes('inquirer') ||
      result.source.includes('rappler') ||
      result.source.includes('businessworld') ||
      result.source.includes('bsp.gov.ph')
    ).slice(0, 3)
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }
}
