'use client'

import { Navbar } from '@/components/ui/navbar'

export default function NavbarPreview() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="dashboard" />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Navbar Preview</h1>
          <p className="text-gray-600 mb-6">
            This page showcases the redesigned navigation bar with the following improvements:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ New Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Organized Dropdowns:</strong> Learning, Tools, and Finance sections</li>
                <li>• <strong>Improved Mobile Experience:</strong> Collapsible menu with better organization</li>
                <li>• <strong>Enhanced Visual Design:</strong> Better spacing, shadows, and hover effects</li>
                <li>• <strong>Responsive Layout:</strong> Adapts to different screen sizes</li>
                <li>• <strong>Quick Access:</strong> Main actions (Dashboard, AI Assistant) always visible</li>
                <li>• <strong>Descriptive Tooltips:</strong> Each menu item includes helpful descriptions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Dropdown Sections</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-primary">Learning:</strong>
                  <span className="text-gray-600 ml-2">Learning Hub, Challenges, Money Missions</span>
                </div>
                <div>
                  <strong className="text-primary">Tools:</strong>
                  <span className="text-gray-600 ml-2">Digital Tools, Budget Calculator, Savings Tracker</span>
                </div>
                <div>
                  <strong className="text-primary">Finance:</strong>
                  <span className="text-gray-600 ml-2">Goals, Add Transaction, Pricing</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📱 Try the Mobile View</h4>
            <p className="text-blue-800 text-sm">
              Resize your browser window or use developer tools to see the mobile navigation experience. 
              The hamburger menu provides organized sections for easy navigation on smaller screens.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
