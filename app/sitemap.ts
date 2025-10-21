import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.plounix.xyz'
  
  const routes = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/auth/login', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/auth/register', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/ai-assistant', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/learning', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/goals', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/challenges', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/resource-hub', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/digital-tools', priority: 0.6, changeFreq: 'monthly' as const },
    { path: '/pricing', priority: 0.6, changeFreq: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/terms', priority: 0.5, changeFreq: 'monthly' as const },
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }))
}
