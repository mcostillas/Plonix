interface ReceiptData {
  merchant: string
  amount: number
  date: string
  items: string[]
  category: string
  paymentMethod: string
}

export class ReceiptScanner {
  // Step 1: Extract text using Google Vision API (cheaper)
  async extractTextFromImage(imageFile: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    // Simulate Google Vision API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock OCR result
        const ocrText = `
        JOLLIBEE AYALA TRIANGLE
        Date: 01/15/2024 2:30 PM
        
        Chickenjoy w/ Rice    99.00
        Peach Mango Pie      35.00
        Iced Tea            39.00
        Service Charge      12.50
        
        TOTAL: PHP 185.50
        GCASH PAYMENT
        `
        resolve(ocrText)
      }, 1500)
    })
  }

  // Step 2: Analyze extracted text using GPT-4o Mini (smarter)
  async analyzeReceiptText(extractedText: string): Promise<ReceiptData> {
    const prompt = `
    Analyze this Filipino receipt text and extract structured data:
    
    ${extractedText}
    
    Return JSON format:
    {
      "merchant": "store name",
      "amount": number,
      "date": "YYYY-MM-DD",
      "items": ["item1", "item2"],
      "category": "Food & Dining|Shopping|Transportation|etc",
      "paymentMethod": "Cash|GCash|PayMaya|Card"
    }
    
    Use Filipino business knowledge for categorization.
    `
    
    // Simulate GPT-4o Mini API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          merchant: "Jollibee Ayala Triangle",
          amount: 185.50,
          date: "2024-01-15",
          items: ["Chickenjoy w/ Rice", "Peach Mango Pie", "Iced Tea"],
          category: "Food & Dining",
          paymentMethod: "GCash"
        })
      }, 1000)
    })
  }

  // Combined method
  async scanReceipt(imageFile: File): Promise<ReceiptData> {
    try {
      // Step 1: OCR with Google Vision (₱0.50-2.00)
      const extractedText = await this.extractTextFromImage(imageFile)
      
      // Step 2: AI analysis with GPT-4o Mini (₱1.00-2.00)
      const receiptData = await this.analyzeReceiptText(extractedText)
      
      return receiptData
    } catch (error) {
      throw new Error('Failed to scan receipt: ' + error)
    }
  }
}
