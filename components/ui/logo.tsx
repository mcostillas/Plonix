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
      viewBox="0 0 40 24" 
      className={`${sizeClasses[size]} ${className}`}
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Brain on the left */}
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 8 C4 8 2 10 2 12 C2 14 4 16 6 16 C6 18 8 20 10 20 C12 20 14 18 14 16 C14 14 12 12 10 12 C10 10 8 8 6 8" />
        <path d="M8 10 C9 10 10 11 10 12" />
        <path d="M6 12 C7 12 8 13 8 14" />
      </g>
      
      {/* Bold "P" on the right */}
      <path 
        d="M20 4 L20 20 L24 20 L24 14 L30 14 C33 14 35 12 35 10 C35 8 33 6 30 6 L24 6 L24 4 L20 4 Z M24 8 L30 8 C31 8 32 9 32 10 C32 11 31 12 30 12 L24 12 L24 8 Z" 
        fillRule="evenodd"
      />
    </svg>
  )
}
