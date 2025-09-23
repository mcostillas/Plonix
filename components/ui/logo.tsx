interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'icon' | 'full' | 'stacked'
  theme?: 'default' | 'green' | 'minimal'
}

export function PlounixLogo({ 
  className = '', 
  size = 'md', 
  variant = 'icon',
  theme = 'green'
}: LogoProps) {
  const sizeClasses = {
    sm: variant === 'icon' ? 'w-6 h-6' : 'h-6',
    md: variant === 'icon' ? 'w-8 h-8' : 'h-8', 
    lg: variant === 'icon' ? 'w-12 h-12' : 'h-12',
    xl: variant === 'icon' ? 'w-16 h-16' : 'h-16'
  }

  // Color themes
  const getColors = () => {
    switch (theme) {
      case 'green':
        return {
          primary: 'hsl(142.1, 76.2%, 36.3%)', // System primary color
          secondary: 'hsl(142.1, 70.6%, 45.3%)', // Slightly lighter variant
          accent: 'hsl(142.1, 80%, 30%)' // Darker variant
        }
      case 'minimal':
        return {
          primary: 'currentColor',
          secondary: 'currentColor', 
          accent: 'currentColor'
        }
      default:
        return {
          primary: 'currentColor',
          secondary: 'currentColor',
          accent: 'currentColor'
        }
    }
  }

  const colors = getColors()

  // Icon-only logo
  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className} relative flex-shrink-0`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={theme === 'green' ? colors.primary : 'currentColor'}
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-full h-full"
        >
          {/* Brain/Head shape - represents learning and intelligence */}
          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/>
          <path d="M2 9v1c0 1.1.9 2 2 2h1"/>
          <path d="M16 11h0"/>
        </svg>
      </div>
    )
  }

  // Full logo with text
  if (variant === 'full') {
    const textSize = {
      sm: 'text-lg',
      md: 'text-xl', 
      lg: 'text-3xl',
      xl: 'text-4xl'
    }

    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <PlounixLogo size={size} variant="icon" theme={theme} />
        <div className="flex flex-col">
          <span 
            className={`font-bold ${textSize[size]} leading-tight text-primary`}
          >
            Plounix
          </span>
        </div>
      </div>
    )
  }

  // Stacked logo (icon on top, text below)
  if (variant === 'stacked') {
    const textSize = {
      sm: 'text-sm',
      md: 'text-base', 
      lg: 'text-lg',
      xl: 'text-xl'
    }

    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <PlounixLogo size={size} variant="icon" theme={theme} />
        <div className="text-center">
          <div 
            className={`font-bold ${textSize[size]} text-primary`}
          >
            Plounix
          </div>
        </div>
      </div>
    )
  }

  return null
}
