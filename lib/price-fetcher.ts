interface PriceData {
  item: string
  price: number
  currency: string
  source: string
  lastUpdated: string
}

export class PriceFetcher {
  // Philippine e-commerce APIs
  private static readonly PRICE_SOURCES = {
    lazada: 'https://api.lazada.com.ph/search',
    shopee: 'https://shopee.ph/api/search',
    // Mock API for demo purposes
    mock: 'https://api.mockprices.ph/search'
  }

  static async searchPrice(query: string): Promise<PriceData | null> {
    try {
      // For demo - use mock data with realistic prices
      const mockPrices = this.getMockPrices()
      const result = mockPrices.find(item => 
        item.item.toLowerCase().includes(query.toLowerCase())
      )
      
      if (result) {
        return {
          ...result,
          lastUpdated: new Date().toISOString()
        }
      }

      // In production, you'd call real APIs:
      // const response = await fetch(`${this.PRICE_SOURCES.lazada}?q=${encodeURIComponent(query)}`)
      // const data = await response.json()
      // return this.parseApiResponse(data)

      return null
    } catch (error) {
      console.error('Price fetch error:', error)
      return null
    }
  }

  private static getMockPrices(): PriceData[] {
    return [
      { item: 'iPhone 15', price: 65000, currency: 'PHP', source: 'Lazada PH' },
      { item: 'iPhone 15 Pro', price: 75000, currency: 'PHP', source: 'Shopee PH' },
      { item: 'Samsung Galaxy S24', price: 55000, currency: 'PHP', source: 'Lazada PH' },
      { item: 'MacBook Air M2', price: 85000, currency: 'PHP', source: 'Power Mac Center' },
      { item: 'iPad Air', price: 35000, currency: 'PHP', source: 'iStudio' },
      { item: 'AirPods Pro', price: 12000, currency: 'PHP', source: 'Shopee PH' },
      { item: 'PlayStation 5', price: 30000, currency: 'PHP', source: 'GameXtreme' },
      { item: 'Nintendo Switch', price: 18000, currency: 'PHP', source: 'Datablitz' },
      { item: 'Laptop Asus', price: 45000, currency: 'PHP', source: 'PC Express' },
      { item: 'Honda Click 150', price: 120000, currency: 'PHP', source: 'Honda PH' }
    ]
  }

  static async getBestPrice(query: string): Promise<PriceData[]> {
    // In production, search multiple sources and return best prices
    const mockResults = this.getMockPrices().filter(item =>
      item.item.toLowerCase().includes(query.toLowerCase())
    )
    
    return mockResults.sort((a, b) => a.price - b.price) // Sort by price
  }
}
