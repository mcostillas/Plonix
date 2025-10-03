'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/lib/auth-hooks'
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
      ...filteredTransactions.map(transaction => formatCSVRow([
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
      ...filteredTransactions.map(transaction => formatCSVRow([
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
    const savingsRate = ((summary.netCashflow / summary.totalIncome) * 100).toFixed(1)
    const summaryText = [
      `During this period, you had a total income of PHP ${summary.totalIncome.toLocaleString()} and expenses of PHP ${summary.totalExpenses.toLocaleString()}.`,
      `This resulted in a net cashflow of PHP ${summary.netCashflow.toLocaleString()}, representing a ${savingsRate}% savings rate.`,
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
      ['Savings Rate', `${savingsRate}%`],
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

    const allTransactionData = filteredTransactions.map(transaction => [
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

  // Mock data - this would come from your database
  const transactions = [
    { id: 1, type: 'expense', amount: 285, description: 'Jollibee Dinner', category: 'Food & Dining', date: '2025-09-23', time: '19:30' },
    { id: 2, type: 'income', amount: 2500, description: 'Freelance Payment', category: 'Income', date: '2025-09-22', time: '14:15' },
    { id: 3, type: 'expense', amount: 24, description: 'Jeepney Fare', category: 'Transportation', date: '2025-09-22', time: '08:30' },
    { id: 4, type: 'expense', amount: 549, description: 'Netflix Subscription', category: 'Entertainment', date: '2025-09-21', time: '12:00' },
    { id: 5, type: 'income', amount: 15000, description: 'Monthly Salary', category: 'Income', date: '2025-09-15', time: '09:00' },
    { id: 6, type: 'expense', amount: 1200, description: 'Groceries', category: 'Food & Dining', date: '2025-09-20', time: '16:45' },
    { id: 7, type: 'expense', amount: 150, description: 'Coffee Shop', category: 'Food & Dining', date: '2025-09-19', time: '10:20' },
    { id: 8, type: 'expense', amount: 80, description: 'Bus Fare', category: 'Transportation', date: '2025-09-18', time: '07:45' },
    { id: 9, type: 'income', amount: 1250, description: 'Weekly Allowance', category: 'Income', date: '2025-09-17', time: '12:00' },
    { id: 10, type: 'expense', amount: 450, description: 'Phone Bill', category: 'Utilities', date: '2025-09-16', time: '14:30' }
  ]

  const categories = [
    { name: 'Food & Dining', amount: 4200, transactions: 15, color: 'bg-blue-500', percentage: 32.8 },
    { name: 'Transportation', amount: 2800, transactions: 22, color: 'bg-green-500', percentage: 21.9 },
    { name: 'Entertainment', amount: 1950, transactions: 8, color: 'bg-purple-500', percentage: 15.2 },
    { name: 'Utilities', amount: 2100, transactions: 6, color: 'bg-yellow-500', percentage: 16.4 },
    { name: 'Others', amount: 1750, transactions: 12, color: 'bg-orange-500', percentage: 13.7 }
  ]

  const summary = {
    totalIncome: 18750,
    totalExpenses: 12800,
    totalSaved: 8450,
    netCashflow: 5950,
    transactionCount: transactions.length
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedCategory !== 'all' && transaction.category !== selectedCategory) {
      return false
    }
    return true
  })

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
              <Link href="/add-transaction">
                <Button size="sm">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">₱{summary.totalIncome.toLocaleString()}</p>
                  <p className="text-sm text-green-700 font-medium">Total Income</p>
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
                  <p className="text-sm text-red-700 font-medium">Total Expenses</p>
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
                  <p className="text-sm text-blue-700 font-medium">Net Cashflow</p>
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
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">All Categories</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTransactions.map((transaction) => (
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
                        <p className="text-xs text-gray-600">
                          {transaction.category} • {transaction.date} • {transaction.time}
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
            <div className="grid md:grid-cols-2 gap-8">
              {/* Income Sources */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-600">Income Sources</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Monthly Salary</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">₱15,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium">Freelance Work</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">₱2,500</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                      <span className="text-sm font-medium">Allowance</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">₱1,250</span>
                  </div>
                </div>
              </div>

              {/* Top Expenses */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-600">Top Expenses</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Food & Dining</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">₱4,200</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Transportation</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">₱2,800</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Utilities</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">₱2,100</span>
                  </div>
                </div>
              </div>
            </div>

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
    </div>
  )
}
