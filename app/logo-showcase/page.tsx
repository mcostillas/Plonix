'use client'

import { PlounixLogo } from '@/components/ui/logo'

export default function LogoShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Plounix Logo Showcase</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A comprehensive view of the Plounix brand identity, featuring a brain/intelligence icon that represents 
            learning, financial education, and smart money decisions.
          </p>
        </div>

        <div className="space-y-12">
          {/* Hero Logo */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Hero Logo</h2>
            <div className="flex justify-center items-center py-8">
              <PlounixLogo variant="full" size="xl" theme="green" />
            </div>
          </section>

          {/* Logo Variants */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Logo Variants</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Icon Only */}
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Icon Only</h3>
                <div className="flex justify-center space-x-4">
                  <div className="p-4">
                    <PlounixLogo variant="icon" size="sm" theme="green" />
                    <p className="text-xs text-gray-500 mt-2">Small</p>
                  </div>
                  <div className="p-4">
                    <PlounixLogo variant="icon" size="md" theme="green" />
                    <p className="text-xs text-gray-500 mt-2">Medium</p>
                  </div>
                  <div className="p-4">
                    <PlounixLogo variant="icon" size="lg" theme="green" />
                    <p className="text-xs text-gray-500 mt-2">Large</p>
                  </div>
                </div>
              </div>

              {/* Full Logo */}
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Full Logo</h3>
                <div className="space-y-4">
                  <div className="p-4">
                    <PlounixLogo variant="full" size="sm" theme="green" />
                    <p className="text-xs text-gray-500 mt-2">Small</p>
                  </div>
                  <div className="p-4">
                    <PlounixLogo variant="full" size="md" theme="green" />
                    <p className="text-xs text-gray-500 mt-2">Medium</p>
                  </div>
                  <div className="p-4">
                    <PlounixLogo variant="full" size="lg" theme="green" />
                    <p className="text-xs text-gray-500 mt-2">Large</p>
                  </div>
                </div>
              </div>

              {/* Stacked Logo */}
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Stacked Logo</h3>
                <div className="space-y-6">
                  <div className="p-4">
                    <PlounixLogo variant="stacked" size="sm" theme="green" />
                    <p className="text-xs text-gray-500 mt-2">Small</p>
                  </div>
                  <div className="p-4">
                    <PlounixLogo variant="stacked" size="md" theme="green" />
                    <p className="text-xs text-gray-500 mt-2">Medium</p>
                  </div>
                  <div className="p-4">
                    <PlounixLogo variant="stacked" size="lg" theme="green" />
                    <p className="text-xs text-gray-500 mt-2">Large</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Theme Variations */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Theme Variations</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Default Theme */}
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Minimal Theme</h3>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <PlounixLogo variant="full" size="lg" theme="minimal" className="text-primary" />
                </div>
                <p className="text-sm text-gray-600">Uses current color context, perfect for matching your brand colors</p>
              </div>

              {/* Green Theme */}
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-700">Green Theme</h3>
                <div className="p-6 bg-gray-50 rounded-lg">
                  <PlounixLogo variant="full" size="lg" theme="green" />
                </div>
                <p className="text-sm text-gray-600">Beautiful emerald green brain icon, perfect for representing intelligent financial decisions</p>
              </div>
            </div>
          </section>

          {/* Dark Backgrounds */}
          <section className="bg-gray-900 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Dark Background Usage</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-300">Minimal on Dark</h3>
                <div className="p-6">
                  <PlounixLogo variant="full" size="md" theme="minimal" className="text-white" />
                </div>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-300">Green on Dark</h3>
                <div className="p-6">
                  <PlounixLogo variant="full" size="md" theme="green" />
                </div>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-gray-300">Icon Only</h3>
                <div className="p-6 flex justify-center">
                  <PlounixLogo variant="icon" size="lg" theme="green" />
                </div>
              </div>
            </div>
          </section>

          {/* Usage Guidelines */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Usage Guidelines</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-4">✅ Best Practices</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li>• Use the green theme for primary branding and growth messaging</li>
                  <li>• Icon-only version works great for favicons and small spaces</li>
                  <li>• Full logo variant is perfect for navigation bars</li>
                  <li>• Stacked logo works well in square layouts and cards</li>
                  <li>• Maintain adequate white space around the logo</li>
                  <li>• Simple line design scales perfectly at any size</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-4">❌ Avoid These</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li>• Don't stretch or compress the logo disproportionately</li>
                  <li>• Avoid using on backgrounds with insufficient contrast</li>
                  <li>• Don't modify the green colors or line weights</li>
                  <li>• Avoid placing on busy or textured backgrounds</li>
                  <li>• Don't use sizes smaller than the minimum recommended</li>
                  <li>• Never separate the icon from the text in full/stacked variants</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Logo Meaning */}
          <section className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-semibold mb-6 text-center">Logo Design Elements</h2>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-lg font-semibold mb-2">Brain/Intelligence</h3>
                <p className="text-green-100 text-sm">
                  Represents learning, smart decisions, and financial intelligence
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-4">�</div>
                <h3 className="text-lg font-semibold mb-2">Green Color</h3>
                <p className="text-green-100 text-sm">
                  Green symbolizes money, growth, prosperity, and financial success
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Education Focus</h3>
                <p className="text-green-100 text-sm">
                  Brain icon emphasizes learning and building financial knowledge
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            The Plounix logo uses a brain/intelligence icon to represent smart financial learning, 
            combined with a modern green color scheme that symbolizes growth and prosperity.
          </p>
        </div>
      </div>
    </div>
  )
}
