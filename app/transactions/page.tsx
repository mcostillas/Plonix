'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/lib/auth-hooks'
import { AuthGuard } from '@/components/AuthGuard'
import { AddTransactionModal } from '@/components/AddTransactionModal'
import { EditTransactionModal } from '@/components/EditTransactionModal'
import { DeleteTransactionModal } from '@/components/DeleteTransactionModal'
import { MonthlyBillsManager } from '@/components/MonthlyBillsManager'
import { PageSpinner, Spinner } from '@/components/ui/spinner'
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar, 
  Filter, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Receipt,
  DollarSign,
  Download,
  Eye,
  Edit3,
  Trash2,
  ChevronDown,
  FileText,
  FileSpreadsheet
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <TransactionsContent />
    </AuthGuard>
  )
}

function TransactionsContent() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false)
  const [showDeleteTransactionModal, setShowDeleteTransactionModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [monthlyBills, setMonthlyBills] = useState(0)
  const exportDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper function to get period label
  const getPeriodLabel = () => {
    if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
    }
    switch(selectedPeriod) {
      case 'this-month': return 'This Month'
      case 'last-month': return 'Last Month'
      case 'last-3-months': return 'Last 3 Months'
      case 'last-6-months': return 'Last 6 Months'
      case 'this-year': return 'This Year'
      case 'last-year': return 'Last Year'
      case 'all-time': return 'All Time'
      default: return 'This Month'
    }
  }

  // Fetch transactions from database
  useEffect(() => {
    async function fetchTransactions() {
      if (!user?.id) return
      
      console.log('🔍 Fetching transactions for period:', selectedPeriod)
      setLoading(true)
      try {
        const { supabase } = await import('@/lib/supabase')
        
        // Calculate date range based on selected period
        const now = new Date()
        let startDate: Date | null = null
        let endDate: Date | null = null
        
        if (selectedPeriod === 'custom') {
          if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate)
            endDate = new Date(customEndDate)
          } else {
            // If custom selected but no dates, default to this month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          }
        } else {
          switch(selectedPeriod) {
            case 'this-month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1)
              break
            case 'last-month':
              startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
              endDate = new Date(now.getFullYear(), now.getMonth(), 0)
              break
            case 'last-3-months':
              startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
              break
            case 'last-6-months':
              startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
              break
            case 'this-year':
              startDate = new Date(now.getFullYear(), 0, 1)
              break
            case 'last-year':
              startDate = new Date(now.getFullYear() - 1, 0, 1)
              endDate = new Date(now.getFullYear() - 1, 11, 31)
              break
            case 'all-time':
              // No start date filter for all-time
              startDate = null
              break
            default:
              startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          }
        }
        
        console.log('📅 Date range:', {
          start: startDate?.toISOString().split('T')[0],
          end: endDate?.toISOString().split('T')[0]
        })
        
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
        
        if (startDate) {
          query = query.gte('date', startDate.toISOString().split('T')[0])
        }
        
        if (endDate) {
          query = query.lte('date', endDate.toISOString().split('T')[0])
        }
        
        const { data, error } = await query
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })

        if (!error && data) {
          console.log('✅ Fetched', data.length, 'transactions')
          setTransactions(data)
        } else if (error) {
          console.error('❌ Error fetching transactions:', error)
        }

        // Fetch monthly bills (scheduled payments) - always active regardless of period
        const { data: billsData, error: billsError } = await (supabase as any)
          .from('scheduled_payments')
          .select('amount')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (!billsError && billsData) {
          const totalBills = billsData.reduce((sum: number, bill: any) => sum + Number(bill.amount), 0)
          console.log('✅ Fetched monthly bills:', totalBills)
          setMonthlyBills(totalBills)
        } else if (billsError) {
          console.error('❌ Error fetching monthly bills:', billsError)
          setMonthlyBills(0)
        }
      } catch (err) {
        console.error('❌ Error fetching transactions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [user, selectedPeriod, customStartDate, customEndDate, refreshTrigger])

  // Export function to generate CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Description', 'Category', 'Type', 'Amount']
    
    // Properly escape and format CSV content
    const formatCSVRow = (row: (string | number)[]) => {
      return row.map(cell => {
        const cellStr = String(cell || '')
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',')
    }

    const csvContent = [
      formatCSVRow(headers),
      ...formattedTransactions.map(transaction => formatCSVRow([
        transaction.date,
        transaction.time,
        transaction.description,
        transaction.category,
        transaction.type,
        `PHP ${transaction.amount.toLocaleString()}`
      ]))
    ].join('\n')

    // Add UTF-8 BOM to handle special characters properly
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `financial-overview-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportDropdown(false)
  }

  // Export function to generate detailed CSV with summary
  const exportDetailedCSV = () => {
    const summaryHeaders = ['Metric', 'Value']
    const transactionHeaders = ['Date', 'Time', 'Description', 'Category', 'Type', 'Amount']
    
    const summaryData = [
      ['Total Income', `PHP ${summary.totalIncome.toLocaleString()}`],
      ['Monthly Bills (Set Aside)', `PHP ${summary.monthlyBills.toLocaleString()}`],
      ['Total Expenses', `PHP ${summary.totalExpenses.toLocaleString()}`],
      ['Total Saved', `PHP ${summary.totalSaved.toLocaleString()}`],
      ['Money Left', `PHP ${summary.netCashflow.toLocaleString()}`],
      ['Transaction Count', summary.transactionCount.toString()],
      ['Savings Rate', `${((summary.netCashflow / summary.totalIncome) * 100).toFixed(1)}%`],
      ['Daily Avg Spending', `PHP ${Math.round(summary.totalExpenses / 30).toLocaleString()}`],
      ['Daily Avg Income', `PHP ${Math.round(summary.totalIncome / 30).toLocaleString()}`],
      ['Export Date', new Date().toLocaleDateString()],
      ['Export Time', new Date().toLocaleTimeString()]
    ]

    // Properly escape and format CSV content
    const formatCSVRow = (row: (string | number)[]) => {
      return row.map(cell => {
        const cellStr = String(cell || '')
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',')
    }

    const csvContent = [
      '=== FINANCIAL SUMMARY ===',
      formatCSVRow(summaryHeaders),
      ...summaryData.map(row => formatCSVRow(row)),
      '',
      '=== TRANSACTIONS ===',
      formatCSVRow(transactionHeaders),
      ...formattedTransactions.map(transaction => formatCSVRow([
        transaction.date,
        transaction.time,
        transaction.description,
        transaction.category,
        transaction.type,
        `PHP ${transaction.amount.toLocaleString()}`
      ]))
    ].join('\n')

    // Add UTF-8 BOM to handle special characters properly
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `detailed-financial-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportDropdown(false)
  }

  // Export PDF function with better formatting
  const exportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Financial Overview Report', pageWidth / 2, 25, { align: 'center' })
    
    // Date
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, 35, { align: 'center' })
    
    // Financial Summary Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Financial Summary', margin, 55)
    
    const summaryData = [
      ['Total Income', `PHP ${summary.totalIncome.toLocaleString()}`],
      ['Monthly Bills (Set Aside)', `PHP ${summary.monthlyBills.toLocaleString()}`],
      ['Total Expenses', `PHP ${summary.totalExpenses.toLocaleString()}`],
      ['Total Saved', `PHP ${summary.totalSaved.toLocaleString()}`],
      ['Money Left', `PHP ${summary.netCashflow.toLocaleString()}`],
      ['Transaction Count', summary.transactionCount.toString()],
      ['Savings Rate', `${((summary.netCashflow / summary.totalIncome) * 100).toFixed(1)}%`],
      ['Daily Avg Spending', `PHP ${Math.round(summary.totalExpenses / 30).toLocaleString()}`],
      ['Daily Avg Income', `PHP ${Math.round(summary.totalIncome / 30).toLocaleString()}`]
    ]

    // @ts-ignore - jsPDF autoTable plugin
    autoTable(doc, {
      startY: 65,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin }
    })

    // Get the Y position after the summary table
    // @ts-ignore
    const finalY = (doc as any).lastAutoTable.finalY || 150

    // Transactions Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Recent Transactions', margin, finalY + 20)

    const transactionData = filteredTransactions.slice(0, 20).map(transaction => [
      transaction.date,
      transaction.time,
      transaction.description,
      transaction.category,
      transaction.type === 'income' ? 'Income' : 'Expense',
      `PHP ${transaction.amount.toLocaleString()}`
    ])

    // @ts-ignore - jsPDF autoTable plugin
    autoTable(doc, {
      startY: finalY + 30,
      head: [['Date', 'Time', 'Description', 'Category', 'Type', 'Amount']],
      body: transactionData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 8 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 20 }, // Time
        2: { cellWidth: 40 }, // Description
        3: { cellWidth: 30 }, // Category
        4: { cellWidth: 20 }, // Type
        5: { cellWidth: 25, halign: 'right' } // Amount
      }
    })

    // Save the PDF
    doc.save(`financial-overview-${new Date().toISOString().split('T')[0]}.pdf`)
    setShowExportDropdown(false)
  }

  // Export detailed PDF with charts and better formatting
  const exportDetailedPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20

    // Title Page
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Detailed Financial Report', pageWidth / 2, 40, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Report Period: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' })
    doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, 65, { align: 'center' })
    
    // Executive Summary
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Executive Summary', margin, 90)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const actualSavingsRate = ((summary.totalSaved / summary.totalIncome) * 100).toFixed(1)
    const netSavingsRate = ((summary.netCashflow / summary.totalIncome) * 100).toFixed(1)
    const summaryText = [
      `During this period, you had a total income of PHP ${summary.totalIncome.toLocaleString()} and expenses of PHP ${summary.totalExpenses.toLocaleString()}.`,
      `Your monthly bills of PHP ${summary.monthlyBills.toLocaleString()} are set aside immediately, leaving you with PHP ${summary.netCashflow.toLocaleString()} available.`,
      `You saved PHP ${summary.totalSaved.toLocaleString()} toward your goals (${actualSavingsRate}% savings rate).`,
      `You completed ${summary.transactionCount} transactions with an average daily spending of PHP ${Math.round(summary.totalExpenses / 30).toLocaleString()}.`
    ]
    
    let yPos = 100
    summaryText.forEach(text => {
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin)
      doc.text(lines, margin, yPos)
      yPos += lines.length * 5 + 3
    })

    // Financial Summary Table
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Financial Summary', margin, yPos + 10)

    const detailedSummaryData = [
      ['Total Income', `PHP ${summary.totalIncome.toLocaleString()}`],
      ['Monthly Bills (Set Aside)', `PHP ${summary.monthlyBills.toLocaleString()}`],
      ['Total Expenses', `PHP ${summary.totalExpenses.toLocaleString()}`],
      ['Total Saved', `PHP ${summary.totalSaved.toLocaleString()}`],
      ['Money Left', `PHP ${summary.netCashflow.toLocaleString()}`],
      ['Transaction Count', summary.transactionCount.toString()],
      ['Savings Rate', `${actualSavingsRate}%`],
      ['Daily Average Spending', `PHP ${Math.round(summary.totalExpenses / 30).toLocaleString()}`],
      ['Daily Average Income', `PHP ${Math.round(summary.totalIncome / 30).toLocaleString()}`],
      ['Largest Expense', `PHP ${Math.max(...transactions.filter(t => t.type === 'expense').map(t => t.amount)).toLocaleString()}`],
      ['Largest Income', `PHP ${Math.max(...transactions.filter(t => t.type === 'income').map(t => t.amount)).toLocaleString()}`]
    ]

    // @ts-ignore
    autoTable(doc, {
      startY: yPos + 20,
      head: [['Metric', 'Value']],
      body: detailedSummaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin }
    })

    // New page for transactions
    doc.addPage()
    
    // All Transactions
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('All Transactions', margin, 30)

    const allTransactionData = formattedTransactions.map(transaction => [
      transaction.date,
      transaction.time,
      transaction.description,
      transaction.category,
      transaction.type === 'income' ? 'Income' : 'Expense',
      `PHP ${transaction.amount.toLocaleString()}`
    ])

    // @ts-ignore
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Time', 'Description', 'Category', 'Type', 'Amount']],
      body: allTransactionData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 45 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30, halign: 'right' }
      }
    })

    // Category Breakdown
    doc.addPage()
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Expense Categories Breakdown', margin, 30)

    const categoryData = categories.map(category => [
      category.name,
      category.transactions.toString(),
      `PHP ${category.amount.toLocaleString()}`,
      `${category.percentage}%`
    ])

    // @ts-ignore
    autoTable(doc, {
      startY: 40,
      head: [['Category', 'Transactions', 'Amount', 'Percentage']],
      body: categoryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 11 },
      margin: { left: margin, right: margin }
    })

    // Footer on each page
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' })
      doc.text('Plounix Financial Report', margin, doc.internal.pageSize.height - 10)
    }

    doc.save(`detailed-financial-report-${new Date().toISOString().split('T')[0]}.pdf`)
    setShowExportDropdown(false)
  }

  // Calculate summary from real transactions
  const summary = {
    totalIncome: transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    totalExpenses: transactions
      .filter(t => t.transaction_type === 'expense' && t.category !== 'Savings')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    totalSaved: transactions
      .filter(t => t.transaction_type === 'expense' && t.category === 'Savings')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    monthlyBills: monthlyBills, // Add monthly bills to summary
    netCashflow: 0, // Will calculate below
    transactionCount: transactions.length
  }
  // Money Left = Income - Monthly Bills - Expenses - Savings
  // Monthly bills are deducted immediately, regardless of due date
  summary.netCashflow = summary.totalIncome - summary.monthlyBills - summary.totalExpenses - summary.totalSaved

  // Calculate category breakdown from real data
  const categoryMap = new Map<string, { amount: number; count: number }>()
  transactions
    .filter(t => t.transaction_type === 'expense')
    .forEach(t => {
      // Normalize category names
      let category = t.category || 'Others'
      
      // Capitalize first letter of each word
      category = category.split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      
      // Merge "Food" with "Food & Dining"
      if (category === 'Food') {
        category = 'Food & Dining'
      }
      
      const existing = categoryMap.get(category) || { amount: 0, count: 0 }
      categoryMap.set(category, {
        amount: existing.amount + Number(t.amount),
        count: existing.count + 1
      })
    })

  const totalExpenseAmount = (summary.totalExpenses + summary.totalSaved) || 1 // Include savings in total for percentage calculation
  const categoryColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
  
  const categories = Array.from(categoryMap.entries())
    .map(([name, data], index) => ({
      name,
      amount: data.amount,
      transactions: data.count,
      color: categoryColors[index % categoryColors.length],
      percentage: Math.round((data.amount / totalExpenseAmount) * 100 * 10) / 10 // Round to 1 decimal place
    }))
    .sort((a, b) => b.amount - a.amount)

  // Helper function to normalize category names
  const normalizeCategory = (category: string | null | undefined): string => {
    let normalized = category || 'Others'
    
    // Capitalize first letter of each word
    normalized = normalized.split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
    
    // Merge "Food" with "Food & Dining"
    if (normalized === 'Food') {
      normalized = 'Food & Dining'
    }
    
    return normalized
  }

  // Normalize all transactions first
  const normalizedTransactions = transactions.map(t => ({
    ...t,
    normalizedCategory: normalizeCategory(t.category)
  }))

  // Get unique normalized categories for the dropdown
  const uniqueCategories = Array.from(new Set(normalizedTransactions.map(t => t.normalizedCategory)))
  
  // Apply category filter using normalized categories
  const filteredTransactions = normalizedTransactions.filter(transaction => {
    if (selectedCategory !== 'all' && transaction.normalizedCategory !== selectedCategory) {
      return false
    }
    return true
  })

  console.log('🏷️ Category filter:', selectedCategory)
  console.log('🏷️ Unique normalized categories:', uniqueCategories)
  console.log('📊 Transactions before filter:', transactions.length)
  console.log('📊 Transactions after filter:', filteredTransactions.length)

  // Format transaction for display
  const formattedTransactions = filteredTransactions.map(t => {
    return {
      id: t.id,
      type: t.transaction_type,
      amount: Number(t.amount),
      description: t.merchant,
      category: t.normalizedCategory,
      date: t.date,
      time: new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  })

  if (loading && transactions.length === 0) {
    return <PageSpinner message="Loading transactions..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="transactions" />

      <div className="container mx-auto px-2 md:px-4 py-3 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-3 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0 mb-2 md:mb-4">
            <div>
              <h1 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-900">Financial Overview</h1>
              <p className="text-[10px] md:text-sm lg:text-base text-gray-600">Complete view of your income, expenses, and transactions</p>
            </div>
            <div className="flex space-x-1.5 md:space-x-3">
              <div className="relative" ref={exportDropdownRef}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center h-7 md:h-9 text-[9px] md:text-sm px-2 md:px-3"
                >
                  <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Export
                  <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3 ml-0.5 md:ml-1" />
                </Button>
                
                {showExportDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 md:w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        exportToCSV()
                        setShowExportDropdown(false)
                      }}
                      className="w-full text-left px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-sm hover:bg-gray-50 flex items-center"
                    >
                      <FileSpreadsheet className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-green-600" />
                      <div>
                        <div className="font-medium">Transactions CSV</div>
                        <div className="text-[8px] md:text-xs text-gray-500">Export transaction data only</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportDetailedCSV()
                        setShowExportDropdown(false)
                      }}
                      className="w-full text-left px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-sm hover:bg-gray-50 flex items-center"
                    >
                      <FileText className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-blue-600" />
                      <div>
                        <div className="font-medium">Detailed Report CSV</div>
                        <div className="text-[8px] md:text-xs text-gray-500">Include summary & transactions</div>
                      </div>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        exportPDF()
                        setShowExportDropdown(false)
                      }}
                      className="w-full text-left px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-sm hover:bg-gray-50 flex items-center"
                    >
                      <FileText className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-red-600" />
                      <div>
                        <div className="font-medium">Simple PDF Report</div>
                        <div className="text-[8px] md:text-xs text-gray-500">Basic summary & transactions</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportDetailedPDF()
                        setShowExportDropdown(false)
                      }}
                      className="w-full text-left px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-sm hover:bg-gray-50 flex items-center"
                    >
                      <FileText className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 text-purple-600" />
                      <div>
                        <div className="font-medium">Detailed PDF Report</div>
                        <div className="text-[8px] md:text-xs text-gray-500">Complete analysis with charts</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <Button 
                size="sm"
                onClick={() => setShowAddTransactionModal(true)}
                className="h-7 md:h-9 text-[9px] md:text-sm px-2 md:px-3"
              >
                <PlusCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden xs:inline">Add Transaction</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Period Filter */}
        <Card className="mb-3 md:mb-6">
          <CardContent className="pt-3 md:pt-6 p-2 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="flex-1">
                <label className="text-[10px] md:text-sm font-medium text-gray-700 mb-1 md:mb-2 block">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
                  Time Period
                </label>
                <Select
                  value={selectedPeriod}
                  onValueChange={(value) => {
                    console.log('🔄 Time period changed to:', value)
                    setSelectedPeriod(value)
                    if (value === 'custom') {
                      setShowDatePicker(true)
                    } else {
                      setShowDatePicker(false)
                      setCustomStartDate('')
                      setCustomEndDate('')
                    }
                  }}
                >
                  <SelectTrigger className="w-full md:w-64 h-8 md:h-10 text-[10px] md:text-sm">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="custom">Custom Range...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {showDatePicker && (
                <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:items-end flex-1">
                  <div className="flex-1">
                    <label className="text-[10px] md:text-sm font-medium text-gray-700 mb-1 md:mb-2 block">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full p-1.5 md:p-2 text-[10px] md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] md:text-sm font-medium text-gray-700 mb-1 md:mb-2 block">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full p-1.5 md:p-2 text-[10px] md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (customStartDate && customEndDate) {
                        setShowDatePicker(false)
                      } else {
                        alert('Please select both start and end dates')
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700 h-7 md:h-10 text-[10px] md:text-sm"
                  >
                    Apply
                  </Button>
                </div>
              )}
              
              {selectedPeriod === 'custom' && !showDatePicker && customStartDate && customEndDate && (
                <div className="flex items-center gap-2 text-[10px] md:text-sm text-gray-600">
                  <span className="font-medium">Range: {getPeriodLabel()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDatePicker(true)}
                    className="text-purple-600 hover:text-purple-700 h-6 md:h-8 text-[9px] md:text-xs"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-2 md:pt-6 p-2 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-xl lg:text-2xl font-bold text-green-600 truncate">₱{summary.totalIncome.toLocaleString()}</p>
                  <p className="text-[9px] md:text-xs lg:text-sm text-green-700 font-medium truncate">Income</p>
                  <p className="text-[7px] md:text-[10px] lg:text-xs text-green-600 truncate">{getPeriodLabel()}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 text-green-500 flex-shrink-0 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="pt-2 md:pt-6 p-2 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-xl lg:text-2xl font-bold text-red-600 truncate">₱{summary.totalExpenses.toLocaleString()}</p>
                  <p className="text-[9px] md:text-xs lg:text-sm text-red-700 font-medium truncate">Expenses</p>
                  <p className="text-[7px] md:text-[10px] lg:text-xs text-red-600 truncate">{getPeriodLabel()}</p>
                </div>
                <ArrowDownRight className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 text-red-500 flex-shrink-0 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-2 md:pt-6 p-2 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-xl lg:text-2xl font-bold text-blue-600 truncate">₱{summary.netCashflow.toLocaleString()}</p>
                  <p className="text-[9px] md:text-xs lg:text-sm text-blue-700 font-medium truncate">Money Left</p>
                  <p className="text-[7px] md:text-[10px] lg:text-xs text-blue-600 truncate">After bills (₱{summary.monthlyBills.toLocaleString()})</p>
                </div>
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 text-blue-500 flex-shrink-0 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-2 md:pt-6 p-2 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-xl lg:text-2xl font-bold text-purple-600 truncate">₱{summary.totalSaved.toLocaleString()}</p>
                  <p className="text-[9px] md:text-xs lg:text-sm text-purple-700 font-medium truncate">Total Saved</p>
                </div>
                <PiggyBank className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 text-purple-500 flex-shrink-0 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Payments Management */}
        <div className="mb-3 md:mb-8">
          <MonthlyBillsManager />
        </div>

        <div className="grid lg:grid-cols-3 gap-3 md:gap-8 mb-3 md:mb-6">
          {/* Expense Categories */}
          <Card className="lg:col-span-1">
            <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
              <CardTitle className="flex items-center text-sm md:text-base lg:text-lg">
                <PieChart className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2 text-blue-500" />
                Expense Categories
              </CardTitle>
              <CardDescription className="text-[10px] md:text-sm">This month's spending breakdown</CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="space-y-2 md:space-y-4">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-1.5 md:p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                      <div className={`w-2.5 h-2.5 md:w-4 md:h-4 ${category.color} rounded-full flex-shrink-0`}></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] md:text-sm font-medium truncate">{category.name}</p>
                        <p className="text-[8px] md:text-xs text-gray-600 truncate">{category.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[10px] md:text-sm font-medium">₱{category.amount.toLocaleString()}</p>
                      <p className="text-[8px] md:text-xs text-gray-600">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center text-sm md:text-base lg:text-lg">
                    <Receipt className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2 text-green-500" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription className="text-[10px] md:text-sm">{filteredTransactions.length} transactions found</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      console.log('🏷️ Category changed to:', value)
                      setSelectedCategory(value)
                    }}
                  >
                    <SelectTrigger className="w-32 md:w-40 text-[10px] md:text-sm h-7 md:h-10">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.sort().map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-3 pb-0 md:px-6 md:pt-4 md:pb-0">
              {loading ? (
                <div className="text-center py-4 md:py-8 text-gray-500">
                  <Spinner size="lg" color="primary" className="mx-auto" />
                  <p className="mt-2 text-[10px] md:text-sm">Loading transactions...</p>
                </div>
              ) : formattedTransactions.length === 0 ? (
                <div className="text-center py-4 md:py-8">
                  <Receipt className="w-8 h-8 md:w-12 md:h-12 mx-auto text-gray-300 mb-2 md:mb-3" />
                  <p className="text-[10px] md:text-sm text-gray-500 mb-2 md:mb-4">No transactions found</p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 h-7 md:h-10 text-[10px] md:text-sm"
                    onClick={() => setShowAddTransactionModal(true)}
                  >
                    <PlusCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Add Your First Transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3 max-h-[500px] md:max-h-[600px] overflow-y-auto pb-3 md:pb-4">
                  {formattedTransactions.map((transaction, idx) => {
                    // Find the original transaction object
                    const originalTransaction = filteredTransactions[idx]
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                          <div className={`w-8 h-8 md:w-10 md:h-10 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm font-medium truncate">{transaction.description}</p>
                            <p className="text-[10px] md:text-xs text-gray-600 capitalize truncate">
                              {transaction.category} • {new Date(transaction.date).toLocaleDateString()} • {transaction.time}
                              {originalTransaction.payment_method && (
                                <> • {originalTransaction.payment_method}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-2 flex-shrink-0 ml-3 md:ml-4">
                          <span className={`text-xs md:text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedTransaction(originalTransaction)
                              setShowEditTransactionModal(true)
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-red-50"
                            onClick={() => {
                              setSelectedTransaction(originalTransaction)
                              setShowDeleteTransactionModal(true)
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader className="p-3 md:p-6 pb-2 md:pb-6">
            <CardTitle className="flex items-center text-sm md:text-base lg:text-lg">
              <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5 mr-1.5 md:mr-2 text-purple-500" />
              Monthly Financial Breakdown
            </CardTitle>
            <CardDescription className="text-[10px] md:text-sm">Detailed analysis of your financial activity</CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            {loading ? (
              <div className="text-center py-4 md:py-8">
                <Spinner size="lg" color="primary" className="mx-auto" />
                <p className="mt-2 text-[10px] md:text-sm text-gray-500">Loading breakdown...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-4 md:py-8">
                <Calendar className="w-8 h-8 md:w-12 md:h-12 mx-auto text-gray-300 mb-2 md:mb-3" />
                <p className="text-[10px] md:text-sm text-gray-500">No transaction data available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3 md:gap-8">
                {/* Income Sources */}
                <div>
                  <h3 className="text-xs md:text-base lg:text-lg font-semibold mb-2 md:mb-4 text-green-600">
                    Income Sources ({transactions.filter(t => t.transaction_type === 'income').length})
                  </h3>
                  <div className="space-y-1.5 md:space-y-3">
                    {transactions.filter(t => t.transaction_type === 'income').length === 0 ? (
                      <p className="text-[10px] md:text-sm text-gray-500 p-2 md:p-3">No income recorded yet</p>
                    ) : (
                      transactions
                        .filter(t => t.transaction_type === 'income')
                        .slice(0, 5) // Show top 5
                        .map((tx, index) => (
                          <div key={tx.id} className="flex items-center justify-between p-1.5 md:p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: `hsl(${120 - index * 10}, 70%, ${50 - index * 5}%)` }}></div>
                              <span className="text-[10px] md:text-sm font-medium capitalize truncate">{tx.merchant}</span>
                            </div>
                            <span className="text-[10px] md:text-sm font-semibold text-green-600 flex-shrink-0 ml-2">₱{Number(tx.amount).toLocaleString()}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Top Expenses */}
                <div>
                  <h3 className="text-xs md:text-base lg:text-lg font-semibold mb-2 md:mb-4 text-red-600">
                    Top Expenses (by category)
                  </h3>
                  <div className="space-y-1.5 md:space-y-3">
                    {categories.length === 0 ? (
                      <p className="text-[10px] md:text-sm text-gray-500 p-2 md:p-3">No expenses recorded yet</p>
                    ) : (
                      categories.slice(0, 5).map((cat, index) => (
                        <div key={cat.name} className="flex items-center justify-between p-1.5 md:p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${cat.color.replace('bg-', 'bg-')}`}></div>
                            <span className="text-[10px] md:text-sm font-medium capitalize truncate">{cat.name}</span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className="text-[10px] md:text-sm font-semibold text-red-600">₱{cat.amount.toLocaleString()}</span>
                            <p className="text-[8px] md:text-xs text-gray-500">{cat.transactions} txns</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-3 md:mt-8 pt-3 md:pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-center">
                <div>
                  <p className="text-sm md:text-xl lg:text-2xl font-bold text-gray-900">{summary.transactionCount}</p>
                  <p className="text-[9px] md:text-xs lg:text-sm text-gray-600">Total Transactions</p>
                </div>
                <div>
                  <p className="text-sm md:text-xl lg:text-2xl font-bold text-green-600">
                    {((summary.netCashflow / summary.totalIncome) * 100).toFixed(1)}%
                  </p>
                  <p className="text-[9px] md:text-xs lg:text-sm text-gray-600">Savings Rate</p>
                </div>
                <div>
                  <p className="text-sm md:text-xl lg:text-2xl font-bold text-blue-600">
                    ₱{Math.round(summary.totalExpenses / 30).toLocaleString()}
                  </p>
                  <p className="text-[9px] md:text-xs lg:text-sm text-gray-600">Daily Avg Spending</p>
                </div>
                <div>
                  <p className="text-sm md:text-xl lg:text-2xl font-bold text-purple-600">
                    ₱{Math.round(summary.totalIncome / 30).toLocaleString()}
                  </p>
                  <p className="text-[9px] md:text-xs lg:text-sm text-gray-600">Daily Avg Income</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        onSuccess={() => {
          // Refresh transactions when a new one is added
          setRefreshTrigger(prev => prev + 1)
        }}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={showEditTransactionModal}
        onClose={() => {
          setShowEditTransactionModal(false)
          setSelectedTransaction(null)
        }}
        onSuccess={() => {
          // Refresh transactions when one is updated
          setRefreshTrigger(prev => prev + 1)
        }}
        transaction={selectedTransaction}
      />

      {/* Delete Transaction Modal */}
      <DeleteTransactionModal
        isOpen={showDeleteTransactionModal}
        onClose={() => {
          setShowDeleteTransactionModal(false)
          setSelectedTransaction(null)
        }}
        onSuccess={() => {
          // Refresh transactions when one is deleted
          setRefreshTrigger(prev => prev + 1)
        }}
        transaction={selectedTransaction}
      />
    </div>
  )
}
