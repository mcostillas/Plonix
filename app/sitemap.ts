import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.plounix.xyz'
  
  const routes = [
    '',
    '/auth/login',
    '/auth/signup',
    '/pricing',
    '/privacy',
    '/terms',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
