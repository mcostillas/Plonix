'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/lib/auth-hooks'
import { AddTransactionModal } from '@/components/AddTransactionModal'
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
  ChevronDown,
  FileText,
  FileSpreadsheet
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function TransactionsPage() {
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
  const [refreshTrigger, setRefreshTrigger] = useState(0)
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
          setTransactions(data)
        }
      } catch (err) {
        console.error('Error fetching transactions:', err)
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
      ['Total Expenses', `PHP ${summary.totalExpenses.toLocaleString()}`],
      ['Net Cashflow', `PHP ${summary.netCashflow.toLocaleString()}`],
      ['Total Saved', `PHP ${summary.totalSaved.toLocaleString()}`],
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
      ['Total Expenses', `PHP ${summary.totalExpenses.toLocaleString()}`],
      ['Net Cashflow', `PHP ${summary.netCashflow.toLocaleString()}`],
      ['Total Saved', `PHP ${summary.totalSaved.toLocaleString()}`],
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
      `You saved PHP ${summary.totalSaved.toLocaleString()} toward your goals (${actualSavingsRate}% savings rate) with a net cashflow of PHP ${summary.netCashflow.toLocaleString()}.`,
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
      ['Total Expenses', `PHP ${summary.totalExpenses.toLocaleString()}`],
      ['Net Cashflow', `PHP ${summary.netCashflow.toLocaleString()}`],
      ['Total Saved', `PHP ${summary.totalSaved.toLocaleString()}`],
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
    netCashflow: 0, // Will calculate below
    transactionCount: transactions.length
  }
  summary.netCashflow = summary.totalIncome - summary.totalExpenses - summary.totalSaved

  // Calculate category breakdown from real data
  const categoryMap = new Map<string, { amount: number; count: number }>()
  transactions
    .filter(t => t.transaction_type === 'expense')
    .forEach(t => {
      const category = t.category || 'Others'
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
      percentage: (data.amount / totalExpenseAmount) * 100
    }))
    .sort((a, b) => b.amount - a.amount)

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedCategory !== 'all' && transaction.category !== selectedCategory) {
      return false
    }
    return true
  })

  // Format transaction for display
  const formattedTransactions = filteredTransactions.map(t => ({
    id: t.id,
    type: t.transaction_type,
    amount: Number(t.amount),
    description: t.merchant,
    category: t.category,
    date: t.date,
    time: new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }))

  if (loading && transactions.length === 0) {
    return <PageSpinner message="Loading transactions..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="transactions" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
              <p className="text-gray-600">Complete view of your income, expenses, and transactions</p>
            </div>
            <div className="flex space-x-3">
              <div className="relative" ref={exportDropdownRef}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
                
                {showExportDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        exportToCSV()
                        setShowExportDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-3 text-green-600" />
                      <div>
                        <div className="font-medium">Transactions CSV</div>
                        <div className="text-xs text-gray-500">Export transaction data only</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportDetailedCSV()
                        setShowExportDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-3 text-blue-600" />
                      <div>
                        <div className="font-medium">Detailed Report CSV</div>
                        <div className="text-xs text-gray-500">Include summary & transactions</div>
                      </div>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        exportPDF()
                        setShowExportDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-3 text-red-600" />
                      <div>
                        <div className="font-medium">Simple PDF Report</div>
                        <div className="text-xs text-gray-500">Basic summary & transactions</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportDetailedPDF()
                        setShowExportDropdown(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-3 text-purple-600" />
                      <div>
                        <div className="font-medium">Detailed PDF Report</div>
                        <div className="text-xs text-gray-500">Complete analysis with charts</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <Button 
                size="sm"
                onClick={() => setShowAddTransactionModal(true)}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>

        {/* Period Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Time Period
                </label>
                <Select
                  value={selectedPeriod}
                  onValueChange={(value) => {
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
                  <SelectTrigger className="w-full md:w-64">
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
                <div className="flex flex-col md:flex-row gap-3 md:items-end flex-1">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Apply
                  </Button>
                </div>
              )}
              
              {selectedPeriod === 'custom' && !showDatePicker && customStartDate && customEndDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Range: {getPeriodLabel()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDatePicker(true)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">₱{summary.totalIncome.toLocaleString()}</p>
                  <p className="text-sm text-green-700 font-medium">Income</p>
                  <p className="text-xs text-green-600">{getPeriodLabel()}</p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">₱{summary.totalExpenses.toLocaleString()}</p>
                  <p className="text-sm text-red-700 font-medium">Expenses</p>
                  <p className="text-xs text-red-600">{getPeriodLabel()}</p>
                </div>
                <ArrowDownRight className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">₱{summary.netCashflow.toLocaleString()}</p>
                  <p className="text-sm text-blue-700 font-medium">Net Saved</p>
                  <p className="text-xs text-blue-600">{getPeriodLabel()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">₱{summary.totalSaved.toLocaleString()}</p>
                  <p className="text-sm text-purple-700 font-medium">Total Saved</p>
                </div>
                <PiggyBank className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Payments Management */}
        <div className="mb-8">
          <MonthlyBillsManager />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Expense Categories */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-500" />
                Expense Categories
              </CardTitle>
              <CardDescription>This month's spending breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${category.color} rounded-full`}></div>
                      <div>
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-gray-600">{category.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₱{category.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{category.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Receipt className="w-5 h-5 mr-2 text-green-500" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value)}
                  >
                    <SelectTrigger className="w-40 text-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <Spinner size="lg" color="primary" className="mx-auto" />
                  <p className="mt-2 text-sm">Loading transactions...</p>
                </div>
              ) : formattedTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">No transactions found</p>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowAddTransactionModal(true)}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Your First Transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formattedTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-gray-600 capitalize">
                            {transaction.category} • {new Date(transaction.date).toLocaleDateString()} • {transaction.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              Monthly Financial Breakdown
            </CardTitle>
            <CardDescription>Detailed analysis of your financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Spinner size="lg" color="primary" className="mx-auto" />
                <p className="mt-2 text-sm text-gray-500">Loading breakdown...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No transaction data available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Income Sources */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-600">
                    Income Sources ({transactions.filter(t => t.transaction_type === 'income').length})
                  </h3>
                  <div className="space-y-3">
                    {transactions.filter(t => t.transaction_type === 'income').length === 0 ? (
                      <p className="text-sm text-gray-500 p-3">No income recorded yet</p>
                    ) : (
                      transactions
                        .filter(t => t.transaction_type === 'income')
                        .slice(0, 5) // Show top 5
                        .map((tx, index) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: `hsl(${120 - index * 10}, 70%, ${50 - index * 5}%)` }}></div>
                              <span className="text-sm font-medium capitalize">{tx.merchant}</span>
                            </div>
                            <span className="text-sm font-semibold text-green-600">₱{Number(tx.amount).toLocaleString()}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Top Expenses */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">
                    Top Expenses (by category)
                  </h3>
                  <div className="space-y-3">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3">No expenses recorded yet</p>
                    ) : (
                      categories.slice(0, 5).map((cat, index) => (
                        <div key={cat.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${cat.color.replace('bg-', 'bg-')}`}></div>
                            <span className="text-sm font-medium capitalize">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-red-600">₱{cat.amount.toLocaleString()}</span>
                            <p className="text-xs text-gray-500">{cat.transactions} txns</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{summary.transactionCount}</p>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {((summary.netCashflow / summary.totalIncome) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Savings Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    ₱{Math.round(summary.totalExpenses / 30).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Daily Avg Spending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    ₱{Math.round(summary.totalIncome / 30).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Daily Avg Income</p>
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
    </div>
  )
}
