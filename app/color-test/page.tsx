'use client'

import { PlounixLogo } from '@/components/ui/logo'

export default function ColorTest() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Color System Test</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* System Colors */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">System Colors</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded"></div>
                <div>
                  <p className="font-medium">Primary Color</p>
                  <p className="text-sm text-muted-foreground">hsl(142.1, 76.2%, 36.3%)</p>
                </div>
              </div>
              <div className="text-primary text-lg font-semibold">
                This text uses text-primary class
              </div>
            </div>
          </div>

          {/* Logo Colors */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Logo Colors</h2>
            <div className="space-y-4">
              <PlounixLogo size="lg" className="text-primary" />
              <PlounixLogo size="lg" className="text-green-600" />
              <div className="text-sm text-muted-foreground">
                Logo should now match the exact system primary color
              </div>
            </div>
          </div>
        </div>

        {/* Side by side comparison */}
        <div className="mt-8 bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">Color Comparison</h2>
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded"></div>
              <span className="text-primary font-medium">System Primary</span>
            </div>
            <div className="flex items-center space-x-3">
              <PlounixLogo size="sm" className="text-green-600" />
              <span className="font-medium">Logo Green</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Both should be identical green colors now.
          </p>
        </div>
      </div>
    </div>
  )
}
