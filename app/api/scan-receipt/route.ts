import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    let authenticatedUser = null
    try {
      const authHeader = request.headers.get('Authorization')
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        )
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (user && !error) {
          authenticatedUser = {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email?.split('@')[0]
          }
        }
      }
    } catch (error) {
      console.error('❌ Authentication error:', error)
    }

    if (!authenticatedUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('receipt') as File
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 })
    }

    console.log('📸 Processing receipt:', file.name, file.type, file.size)

    // TODO: Implement actual OCR here
    // For now, return mock data for demonstration
    // You can integrate with:
    // - Tesseract.js (open source, client-side)
    // - Google Cloud Vision API
    // - Azure Computer Vision API
    // - AWS Textract
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock receipt data extraction
    const mockReceiptData = extractMockReceiptData(file.name)

    // Return extracted data
    return NextResponse.json({
      success: true,
      merchant: mockReceiptData.merchant,
      amount: mockReceiptData.amount,
      date: mockReceiptData.date,
      category: mockReceiptData.category,
      items: mockReceiptData.items,
      rawText: mockReceiptData.rawText
    })

  } catch (error) {
    console.error('Receipt scanning error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process receipt' 
    }, { status: 500 })
  }
}

// Mock function to extract receipt data
// Replace this with actual OCR implementation
function extractMockReceiptData(filename: string) {
  // Simulate different receipt types based on filename
  const mockReceipts = [
    {
      merchant: 'Jollibee',
      amount: '245.00',
      date: new Date().toLocaleDateString('en-PH'),
      category: 'Food & Dining',
      items: [
        { name: 'Chickenjoy with Rice', price: 110 },
        { name: 'Jolly Spaghetti', price: 85 },
        { name: 'Pineapple Juice', price: 50 }
      ],
      rawText: 'Jollibee Receipt\n1x Chickenjoy w/ Rice ₱110\n1x Jolly Spaghetti ₱85\n1x Pineapple Juice ₱50\nTotal: ₱245'
    },
    {
      merchant: 'SM Supermarket',
      amount: '1,250.50',
      date: new Date().toLocaleDateString('en-PH'),
      category: 'Groceries',
      items: [
        { name: 'Rice 10kg', price: 485 },
        { name: 'Cooking Oil', price: 180 },
        { name: 'Fresh Vegetables', price: 320.50 },
        { name: 'Eggs 1 dozen', price: 120 },
        { name: 'Milk 1L', price: 145 }
      ],
      rawText: 'SM Supermarket\nRice 10kg ₱485\nCooking Oil ₱180\nVegetables ₱320.50\nEggs ₱120\nMilk ₱145\nTotal: ₱1,250.50'
    },
    {
      merchant: '7-Eleven',
      amount: '87.50',
      date: new Date().toLocaleDateString('en-PH'),
      category: 'Convenience Store',
      items: [
        { name: 'Load Card', price: 50 },
        { name: 'Mineral Water', price: 25 },
        { name: 'Chocolate Bar', price: 12.50 }
      ],
      rawText: '7-Eleven\nLoad Card ₱50\nMineral Water ₱25\nChocolate ₱12.50\nTotal: ₱87.50'
    }
  ]

  // Return random receipt for demo
  return mockReceipts[Math.floor(Math.random() * mockReceipts.length)]
}

// Export route segment config
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
