import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  badge?: {
    text: string
    icon?: LucideIcon
  }
}

export function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      {badge && (
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-4">
          {badge.icon && <badge.icon className="w-3 h-3" />}
          <span>{badge.text}</span>
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
        {title}
      </h1>
      {description && (
        <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}
