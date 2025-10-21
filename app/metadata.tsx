// Structured Data for SEO - JSON-LD
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Plounix',
  url: 'https://www.plounix.xyz',
  logo: 'https://www.plounix.xyz/logo.png',
  description: 'AI-powered financial literacy platform for Filipino young adults aged 18-25',
  sameAs: [
    'https://twitter.com/plounix',
    'https://facebook.com/plounix',
    'https://instagram.com/plounix'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    areaServed: 'PH',
    availableLanguage: ['English', 'Tagalog']
  }
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Plounix',
  url: 'https://www.plounix.xyz',
  description: 'AI-powered financial literacy platform for Filipino young adults',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.plounix.xyz/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
}

export const educationalOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Plounix',
  url: 'https://www.plounix.xyz',
  description: 'AI-powered financial literacy education for Filipino young adults and young professionals',
  areaServed: {
    '@type': 'Country',
    name: 'Philippines'
  },
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
    audienceType: 'Young Adults (18-25 years old)'
  },
  teaches: [
    'Budgeting',
    'Saving',
    'Investing',
    'Financial Planning',
    'Money Management',
    'Personal Finance'
  ]
}

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Plounix',
  applicationCategory: 'FinanceApplication',
  applicationSubCategory: 'Personal Finance',
  operatingSystem: 'Web Browser',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    ratingCount: '1'
  },
  description: 'AI-powered financial literacy app for Filipino young adults and young professionals. Features include AI financial coach (Fili), expense tracking, goal setting, and interactive learning modules.',
  featureList: [
    'AI Financial Coach (Fili)',
    'Expense Tracker',
    'Savings Goal Tracker',
    'Interactive Financial Lessons',
    'Budgeting Calculator',
    'Challenge System',
    'Filipino Context & Culture'
  ],
  screenshot: 'https://www.plounix.xyz/screenshot.png',
  browserRequirements: 'Requires JavaScript. Requires HTML5.'
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Plounix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Plounix is an AI-powered financial literacy platform designed for Filipino young adults (18-25). We help you master budgeting, saving, and investing with personalized guidance from Fili, your AI financial coach.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is Fili AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fili is your AI financial coach available 24/7. Fili provides personalized financial advice tailored to Filipino context and can help you with budgeting, saving, investing, and any financial questions you have.'
      }
    },
    {
      '@type': 'Question',
      name: 'Who is Plounix for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Plounix is designed for Filipino young adults aged 18-25, including college students, fresh graduates, and young professionals. Whether you\'re just starting your financial journey or looking to improve your money habits, Plounix can help.'
      }
    },
    {
      '@type': 'Question',
      name: 'What can I learn on Plounix?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can learn budgeting basics, the 50-30-20 rule, how to build an emergency fund, expense tracking, savings strategies, goal setting, investing fundamentals, and smart money habits - all tailored for Filipino young adults with local context and examples.'
      }
    },
    {
      '@type': 'Question',
      name: 'Do I need to download an app?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No download needed! Plounix is a web-based platform that works on any device with a browser - desktop, laptop, tablet, or smartphone. Just visit plounix.xyz and start learning.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is my financial data safe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Your financial information is encrypted and stored securely. We never share your data with third parties, and we don\'t sell your information. Your privacy is our priority.'
      }
    }
  ]
}

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.plounix.xyz'
    }
  ]
}
