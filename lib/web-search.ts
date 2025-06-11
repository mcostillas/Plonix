export class WebSearchService {
  private apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY // Google API key
  private searchEngineId = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID // Custom Search Engine ID

  async searchWeb(query: string) {
    try {
      // Using Google Custom Search API (100 searches/day free)
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      
      if (data.items) {
        return data.items.map((item: any) => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
          source: this.extractDomain(item.link),
          displayLink: item.displayLink
        }))
      }
      return []
    } catch (error) {
      console.error('Google Custom Search failed:', error)
      return []
    }
  }

  async getCurrentPrice(item: string) {
    const query = `${item} price Philippines 2024 buy online cost Lazada Shopee`
    const results = await this.searchWeb(query)
    
    // Filter for shopping/price-related sites
    const priceResults = results.filter(result => 
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
    return results.filter(result => 
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
    return results.filter(result => 
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
