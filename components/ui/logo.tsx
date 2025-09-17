interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PlounixLogo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <svg 
      viewBox="0 0 32 32" 
      className={`${sizeClasses[size]} ${className}`}
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clean rounded square background */}
      <rect x="0" y="0" width="32" height="32" rx="6" ry="6" fill="currentColor" />
      
      {/* White content */}
      <g fill="white">
        {/* Modern, bold "P" */}
        <path d="M6 4 L6 28 L11 28 L11 18 L18 18 C22.4 18 26 14.4 26 10 C26 5.6 22.4 2 18 2 L6 2 L6 4 Z M11 7 L18 7 C19.7 7 21 8.3 21 10 C21 11.7 19.7 13 18 13 L11 13 L11 7 Z" />
        
        {/* Piggy bank elements */}
        {/* Body of piggy */}
        <ellipse cx="21" cy="22" rx="4" ry="2.5" fill="white" opacity="0.15" />
        
        {/* Coins floating around */}
        <circle cx="24" cy="16" r="1" fill="white" opacity="0.4" />
        <circle cx="26" cy="20" r="0.8" fill="white" opacity="0.3" />
        <circle cx="22" cy="26" r="0.6" fill="white" opacity="0.3" />
        
        {/* Peso symbol */}
        <text x="21" y="24" fontSize="3" textAnchor="middle" fill="white" fontWeight="bold" opacity="0.6">₱</text>
        
        {/* Simple upward trend line */}
        <polyline 
          points="4,26 6,24 8,25 10,22 12,23 14,20" 
          stroke="white" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </g>
    </svg>
  )
}
