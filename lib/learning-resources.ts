/**
 * Learning Resources Database
 * Curated learning materials for skills development
 * Helps users upskill for freelancing and career growth
 */

export interface LearningResource {
  title: string
  url: string
  type: 'YouTube' | 'Website' | 'Course' | 'Tutorial' | 'Documentation' | 'Platform'
  provider: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
  duration?: string
  isFree: boolean
  language: 'English' | 'Filipino' | 'Taglish'
  description: string
  tags: string[]
}

export interface SkillCategory {
  skill: string
  category: string
  description: string
  averageEarning: string
  timeToLearn: string
  resources: LearningResource[]
}

export const learningResourcesDatabase: Record<string, SkillCategory> = {
  // ==================== FREELANCING & WRITING ====================
  contentWriting: {
    skill: 'Content Writing',
    category: 'Writing & Content',
    description: 'Learn to write engaging blog posts, articles, and web content that ranks on Google',
    averageEarning: '₱500-2,000 per article',
    timeToLearn: '2-3 months to become proficient',
    resources: [
      {
        title: 'Content Writing Tutorial for Beginners',
        url: 'https://www.youtube.com/watch?v=cLW3KgdcmOc',
        type: 'YouTube',
        provider: 'Ahrefs',
        difficulty: 'Beginner',
        duration: '15 minutes',
        isFree: true,
        language: 'English',
        description: 'Complete guide to content writing basics, SEO, and structure',
        tags: ['writing', 'SEO', 'blogging']
      },
      {
        title: 'How to Become a Freelance Writer (Step by Step)',
        url: 'https://www.youtube.com/watch?v=cniCbQN4OJg',
        type: 'YouTube',
        provider: 'Gillian Perkins',
        difficulty: 'Beginner',
        duration: '20 minutes',
        isFree: true,
        language: 'English',
        description: 'Practical steps to start your freelance writing career',
        tags: ['freelancing', 'writing', 'career']
      },
      {
        title: 'Hemingway Editor - Improve Your Writing',
        url: 'https://hemingwayapp.com/',
        type: 'Website',
        provider: 'Hemingway App',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Free tool to make your writing bold and clear',
        tags: ['tools', 'editing', 'writing']
      },
      {
        title: 'Grammarly - Writing Assistant',
        url: 'https://www.grammarly.com/',
        type: 'Website',
        provider: 'Grammarly',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'AI-powered grammar and style checker',
        tags: ['tools', 'grammar', 'editing']
      },
      {
        title: 'HubSpot Content Writing Course',
        url: 'https://academy.hubspot.com/courses/content-marketing',
        type: 'Course',
        provider: 'HubSpot Academy',
        difficulty: 'Beginner',
        duration: '5 hours',
        isFree: true,
        language: 'English',
        description: 'Free certified course on content marketing and writing',
        tags: ['certification', 'marketing', 'content']
      }
    ]
  },

  // ==================== GRAPHIC DESIGN ====================
  graphicDesign: {
    skill: 'Graphic Design',
    category: 'Design & Creative',
    description: 'Create stunning logos, social media graphics, and marketing materials',
    averageEarning: '₱1,000-5,000 per project',
    timeToLearn: '3-6 months for portfolio-ready skills',
    resources: [
      {
        title: 'Graphic Design Full Course - FREE',
        url: 'https://www.youtube.com/watch?v=WONZVnlam6U',
        type: 'YouTube',
        provider: 'DesignCourse',
        difficulty: 'Beginner',
        duration: '3.5 hours',
        isFree: true,
        language: 'English',
        description: 'Complete graphic design fundamentals from scratch',
        tags: ['design', 'fundamentals', 'beginner']
      },
      {
        title: 'Canva Tutorial for Beginners',
        url: 'https://www.youtube.com/watch?v=pRo_5dN1PyE',
        type: 'YouTube',
        provider: 'Canva',
        difficulty: 'Beginner',
        duration: '25 minutes',
        isFree: true,
        language: 'English',
        description: 'Master Canva for professional designs without Photoshop',
        tags: ['canva', 'tools', 'beginner']
      },
      {
        title: 'Canva - Free Design Platform',
        url: 'https://www.canva.com/',
        type: 'Platform',
        provider: 'Canva',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Create stunning designs for social media, presentations, and more',
        tags: ['design', 'tools', 'templates']
      },
      {
        title: 'Adobe Photoshop Basics',
        url: 'https://www.youtube.com/watch?v=IyR_uYsRdPs',
        type: 'YouTube',
        provider: 'Adobe',
        difficulty: 'Beginner',
        duration: '1 hour',
        isFree: true,
        language: 'English',
        description: 'Official Adobe tutorial for Photoshop beginners',
        tags: ['photoshop', 'adobe', 'editing']
      },
      {
        title: 'GIMP Tutorial - Free Photoshop Alternative',
        url: 'https://www.youtube.com/watch?v=2EPIUyFJ4ag',
        type: 'YouTube',
        provider: 'TJ FREE',
        difficulty: 'Beginner',
        duration: '30 minutes',
        isFree: true,
        language: 'English',
        description: 'Learn GIMP, a completely free image editor',
        tags: ['gimp', 'free', 'editing']
      },
      {
        title: 'Design Principles Explained',
        url: 'https://www.youtube.com/watch?v=a5KYlHNKQB8',
        type: 'YouTube',
        provider: 'Jesse Showalter',
        difficulty: 'Beginner',
        duration: '15 minutes',
        isFree: true,
        language: 'English',
        description: 'Essential design principles every designer should know',
        tags: ['theory', 'principles', 'design']
      }
    ]
  },

  // ==================== WEB DEVELOPMENT ====================
  webDevelopment: {
    skill: 'Web Development',
    category: 'Programming & Tech',
    description: 'Build websites and web applications from scratch',
    averageEarning: '₱2,000-10,000 per project',
    timeToLearn: '6-12 months for job-ready skills',
    resources: [
      {
        title: 'Web Development Full Course - HTML, CSS, JavaScript',
        url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
        type: 'YouTube',
        provider: 'freeCodeCamp',
        difficulty: 'Beginner',
        duration: '4 hours',
        isFree: true,
        language: 'English',
        description: 'Complete web development bootcamp from zero to hero',
        tags: ['html', 'css', 'javascript', 'fullstack']
      },
      {
        title: 'freeCodeCamp - Learn to Code for Free',
        url: 'https://www.freecodecamp.org/',
        type: 'Platform',
        provider: 'freeCodeCamp',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Free coding bootcamp with certificates',
        tags: ['certification', 'interactive', 'projects']
      },
      {
        title: 'The Odin Project - Full Stack Development',
        url: 'https://www.theodinproject.com/',
        type: 'Platform',
        provider: 'The Odin Project',
        difficulty: 'Beginner',
        isFree: true,
        language: 'English',
        description: 'Free full-stack curriculum with real projects',
        tags: ['fullstack', 'projects', 'curriculum']
      },
      {
        title: 'React JS Full Course',
        url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        type: 'YouTube',
        provider: 'freeCodeCamp',
        difficulty: 'Intermediate',
        duration: '12 hours',
        isFree: true,
        language: 'English',
        description: 'Master React, the most popular web framework',
        tags: ['react', 'framework', 'javascript']
      },
      {
        title: 'MDN Web Docs - Web Development Reference',
        url: 'https://developer.mozilla.org/',
        type: 'Documentation',
        provider: 'Mozilla',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Official web development documentation and tutorials',
        tags: ['reference', 'documentation', 'html', 'css', 'javascript']
      },
      {
        title: 'CS50 Introduction to Computer Science',
        url: 'https://www.youtube.com/watch?v=8mAITcNt710',
        type: 'YouTube',
        provider: 'Harvard University',
        difficulty: 'Beginner',
        duration: 'Full course',
        isFree: true,
        language: 'English',
        description: 'Harvard\'s legendary intro to programming course',
        tags: ['fundamentals', 'computer science', 'programming']
      }
    ]
  },

  // ==================== VIDEO EDITING ====================
  videoEditing: {
    skill: 'Video Editing',
    category: 'Creative & Media',
    description: 'Edit videos for YouTube, TikTok, and professional projects',
    averageEarning: '₱1,500-5,000 per video',
    timeToLearn: '2-4 months to become proficient',
    resources: [
      {
        title: 'Video Editing for Beginners - Complete Course',
        url: 'https://www.youtube.com/watch?v=O-3Ca8AVnY0',
        type: 'YouTube',
        provider: 'Premiere Gal',
        difficulty: 'Beginner',
        duration: '45 minutes',
        isFree: true,
        language: 'English',
        description: 'Learn video editing fundamentals step-by-step',
        tags: ['editing', 'premiere pro', 'beginner']
      },
      {
        title: 'DaVinci Resolve Tutorial - Free Editing Software',
        url: 'https://www.youtube.com/watch?v=UguJiz00meQ',
        type: 'YouTube',
        provider: 'Justin Brown',
        difficulty: 'Beginner',
        duration: '1 hour',
        isFree: true,
        language: 'English',
        description: 'Professional video editing with free software',
        tags: ['davinci resolve', 'free', 'professional']
      },
      {
        title: 'CapCut Tutorial - Mobile Video Editing',
        url: 'https://www.youtube.com/watch?v=j-MFMQ1qOGA',
        type: 'YouTube',
        provider: 'Danie Jay',
        difficulty: 'Beginner',
        duration: '20 minutes',
        isFree: true,
        language: 'English',
        description: 'Edit videos on your phone like a pro',
        tags: ['mobile', 'capcut', 'easy']
      },
      {
        title: 'DaVinci Resolve - Download Free',
        url: 'https://www.blackmagicdesign.com/products/davinciresolve',
        type: 'Platform',
        provider: 'Blackmagic Design',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Professional video editing software - completely free',
        tags: ['software', 'free', 'professional']
      },
      {
        title: 'Adobe Premiere Pro Basics',
        url: 'https://www.youtube.com/watch?v=Hls3Tp7JS8E',
        type: 'YouTube',
        provider: 'Cinecom',
        difficulty: 'Beginner',
        duration: '30 minutes',
        isFree: true,
        language: 'English',
        description: 'Industry-standard video editing software tutorial',
        tags: ['premiere pro', 'adobe', 'professional']
      }
    ]
  },

  // ==================== SOCIAL MEDIA MANAGEMENT ====================
  socialMediaManagement: {
    skill: 'Social Media Management',
    category: 'Digital Marketing',
    description: 'Manage social media accounts, create content, and grow online presence',
    averageEarning: '₱8,000-20,000 per month per client',
    timeToLearn: '1-2 months for basic proficiency',
    resources: [
      {
        title: 'Social Media Marketing Full Course',
        url: 'https://www.youtube.com/watch?v=7JKvfkQ-XqU',
        type: 'YouTube',
        provider: 'Simplilearn',
        difficulty: 'Beginner',
        duration: '9 hours',
        isFree: true,
        language: 'English',
        description: 'Complete guide to social media marketing strategies',
        tags: ['marketing', 'strategy', 'content']
      },
      {
        title: 'Meta Blueprint - Facebook & Instagram Marketing',
        url: 'https://www.facebook.com/business/learn',
        type: 'Platform',
        provider: 'Meta',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Official training for Facebook and Instagram marketing',
        tags: ['facebook', 'instagram', 'ads', 'certification']
      },
      {
        title: 'Social Media Content Creation Tips',
        url: 'https://www.youtube.com/watch?v=Jk4xwOhUUdY',
        type: 'YouTube',
        provider: 'Vanessa Lau',
        difficulty: 'Beginner',
        duration: '15 minutes',
        isFree: true,
        language: 'English',
        description: 'Create engaging content that gets noticed',
        tags: ['content', 'engagement', 'tips']
      },
      {
        title: 'Buffer - Social Media Scheduling Tool',
        url: 'https://buffer.com/',
        type: 'Platform',
        provider: 'Buffer',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Schedule and manage social media posts (free plan available)',
        tags: ['tools', 'scheduling', 'management']
      },
      {
        title: 'How to Grow on Instagram 2024',
        url: 'https://www.youtube.com/watch?v=R5TESVjZBYk',
        type: 'YouTube',
        provider: 'Hootsuite',
        difficulty: 'Intermediate',
        duration: '20 minutes',
        isFree: true,
        language: 'English',
        description: 'Latest Instagram growth strategies and tips',
        tags: ['instagram', 'growth', 'strategy']
      }
    ]
  },

  // ==================== DATA ENTRY & VIRTUAL ASSISTANT ====================
  virtualAssistant: {
    skill: 'Virtual Assistant',
    category: 'Administrative & Support',
    description: 'Provide remote administrative support to businesses and entrepreneurs',
    averageEarning: '₱15,000-25,000 per month',
    timeToLearn: '1-2 months to get started',
    resources: [
      {
        title: 'How to Become a Virtual Assistant',
        url: 'https://www.youtube.com/watch?v=6uwgUlkwxFE',
        type: 'YouTube',
        provider: 'Abbey Ashley',
        difficulty: 'Beginner',
        duration: '15 minutes',
        isFree: true,
        language: 'English',
        description: 'Complete guide to starting your VA career',
        tags: ['career', 'freelancing', 'beginner']
      },
      {
        title: 'Google Workspace Tutorial',
        url: 'https://www.youtube.com/watch?v=sJp-Ea_vFx0',
        type: 'YouTube',
        provider: 'Google Workspace',
        difficulty: 'Beginner',
        duration: '30 minutes',
        isFree: true,
        language: 'English',
        description: 'Master Gmail, Docs, Sheets, and Calendar',
        tags: ['google', 'tools', 'productivity']
      },
      {
        title: 'Microsoft Office Basics',
        url: 'https://www.youtube.com/watch?v=y8p4fB00Pys',
        type: 'YouTube',
        provider: 'Teacher\'s Tech',
        difficulty: 'Beginner',
        duration: '1 hour',
        isFree: true,
        language: 'English',
        description: 'Essential MS Office skills for virtual assistants',
        tags: ['microsoft', 'office', 'productivity']
      },
      {
        title: 'Notion Tutorial - Productivity Tool',
        url: 'https://www.youtube.com/watch?v=oTahLEX3NXo',
        type: 'YouTube',
        provider: 'Notion',
        difficulty: 'Beginner',
        duration: '25 minutes',
        isFree: true,
        language: 'English',
        description: 'Learn Notion for project management and organization',
        tags: ['notion', 'productivity', 'organization']
      },
      {
        title: 'Email Management Best Practices',
        url: 'https://www.youtube.com/watch?v=5-5z6yIq2Hc',
        type: 'YouTube',
        provider: 'Income School',
        difficulty: 'Beginner',
        duration: '12 minutes',
        isFree: true,
        language: 'English',
        description: 'Efficient email management techniques',
        tags: ['email', 'productivity', 'organization']
      }
    ]
  },

  // ==================== ONLINE TUTORING ====================
  onlineTutoring: {
    skill: 'Online Tutoring',
    category: 'Education & Teaching',
    description: 'Teach English, Math, Science, or other subjects to students worldwide',
    averageEarning: '₱300-800 per hour',
    timeToLearn: 'Can start immediately with expertise',
    resources: [
      {
        title: 'How to Teach English Online',
        url: 'https://www.youtube.com/watch?v=P7aRXvvGPNo',
        type: 'YouTube',
        provider: 'Teach Travel ESL',
        difficulty: 'Beginner',
        duration: '20 minutes',
        isFree: true,
        language: 'English',
        description: 'Complete guide to online English teaching',
        tags: ['esl', 'teaching', 'english']
      },
      {
        title: 'Classroom Management for Online Teachers',
        url: 'https://www.youtube.com/watch?v=ZSmHCMvNfpc',
        type: 'YouTube',
        provider: 'Edmentum',
        difficulty: 'Beginner',
        duration: '10 minutes',
        isFree: true,
        language: 'English',
        description: 'Engage students effectively in virtual classrooms',
        tags: ['teaching', 'management', 'engagement']
      },
      {
        title: 'Zoom Tutorial for Teachers',
        url: 'https://www.youtube.com/watch?v=TZPx5lHiOYw',
        type: 'YouTube',
        provider: 'Tech for Teachers',
        difficulty: 'Beginner',
        duration: '15 minutes',
        isFree: true,
        language: 'English',
        description: 'Master Zoom for online teaching',
        tags: ['zoom', 'tools', 'teaching']
      },
      {
        title: 'Create Interactive Lessons with Canva',
        url: 'https://www.youtube.com/watch?v=8Dz1zGHl8iQ',
        type: 'YouTube',
        provider: 'Rachel Parlett',
        difficulty: 'Beginner',
        duration: '20 minutes',
        isFree: true,
        language: 'English',
        description: 'Design engaging lesson materials',
        tags: ['canva', 'design', 'lessons']
      },
      {
        title: 'TESOL Certification Course Overview',
        url: 'https://www.youtube.com/watch?v=_cJ_9BLXQ2I',
        type: 'YouTube',
        provider: 'International TEFL Academy',
        difficulty: 'All Levels',
        duration: '12 minutes',
        isFree: true,
        language: 'English',
        description: 'Learn about professional teaching certifications',
        tags: ['certification', 'tesol', 'professional']
      }
    ]
  },

  // ==================== E-COMMERCE & ONLINE SELLING ====================
  ecommerce: {
    skill: 'E-commerce & Online Selling',
    category: 'Business & Entrepreneurship',
    description: 'Start and grow an online store on Shopee, Lazada, or Facebook',
    averageEarning: '₱5,000-50,000 per month',
    timeToLearn: '2-3 months to set up and learn basics',
    resources: [
      {
        title: 'How to Start Shopee Business from Zero',
        url: 'https://www.youtube.com/watch?v=h5VqNFjHOTs',
        type: 'YouTube',
        provider: 'Filipino entrepreneurs',
        difficulty: 'Beginner',
        duration: '25 minutes',
        isFree: true,
        language: 'Taglish',
        description: 'Complete Shopee seller guide for Filipinos',
        tags: ['shopee', 'philippines', 'selling']
      },
      {
        title: 'Product Photography with Your Phone',
        url: 'https://www.youtube.com/watch?v=c80ZJKHiPB4',
        type: 'YouTube',
        provider: 'Shopify',
        difficulty: 'Beginner',
        duration: '12 minutes',
        isFree: true,
        language: 'English',
        description: 'Take professional product photos with just your phone',
        tags: ['photography', 'product', 'mobile']
      },
      {
        title: 'Dropshipping Guide for Beginners',
        url: 'https://www.youtube.com/watch?v=85qE3f9F5zM',
        type: 'YouTube',
        provider: 'Wholesale Ted',
        difficulty: 'Beginner',
        duration: '18 minutes',
        isFree: true,
        language: 'English',
        description: 'Start dropshipping with no inventory',
        tags: ['dropshipping', 'business', 'beginner']
      },
      {
        title: 'Facebook Marketplace Selling Tips',
        url: 'https://www.youtube.com/watch?v=vYXDRHaFchA',
        type: 'YouTube',
        provider: 'Brian Dean',
        difficulty: 'Beginner',
        duration: '15 minutes',
        isFree: true,
        language: 'English',
        description: 'Maximize sales on Facebook Marketplace',
        tags: ['facebook', 'marketplace', 'selling']
      },
      {
        title: 'Shopee Seller Center Tutorial',
        url: 'https://seller.shopee.ph/edu/article/1943',
        type: 'Tutorial',
        provider: 'Shopee Philippines',
        difficulty: 'Beginner',
        isFree: true,
        language: 'English',
        description: 'Official Shopee seller training and resources',
        tags: ['shopee', 'seller', 'official']
      }
    ]
  },

  // ==================== FILIPINO LANGUAGE (For teaching abroad) ====================
  tagalog: {
    skill: 'Teaching Tagalog/Filipino',
    category: 'Language Teaching',
    description: 'Teach Filipino language to foreigners online',
    averageEarning: '₱400-1,000 per hour',
    timeToLearn: 'Can start immediately if fluent',
    resources: [
      {
        title: 'How to Teach Your Native Language Online',
        url: 'https://www.youtube.com/watch?v=LW5EyUg6yO0',
        type: 'YouTube',
        provider: 'Lindsay Does Languages',
        difficulty: 'Beginner',
        duration: '15 minutes',
        isFree: true,
        language: 'English',
        description: 'Guide to teaching your native language as a tutor',
        tags: ['teaching', 'language', 'tutoring']
      },
      {
        title: 'italki - Teach Languages Online',
        url: 'https://www.italki.com/teach',
        type: 'Platform',
        provider: 'italki',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Platform to teach Filipino to international students',
        tags: ['platform', 'teaching', 'filipino']
      },
      {
        title: 'Preply - Online Tutoring Platform',
        url: 'https://preply.com/en/teach',
        type: 'Platform',
        provider: 'Preply',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Another platform for teaching languages including Tagalog',
        tags: ['platform', 'tutoring', 'languages']
      },
      {
        title: 'Creating Lesson Plans for Language Teaching',
        url: 'https://www.youtube.com/watch?v=N3AkSjYBaBg',
        type: 'YouTube',
        provider: 'FluentU',
        difficulty: 'Beginner',
        duration: '10 minutes',
        isFree: true,
        language: 'English',
        description: 'Structure effective language lessons',
        tags: ['lesson planning', 'teaching', 'structure']
      }
    ]
  },

  // ==================== DIGITAL MARKETING ====================
  digitalMarketing: {
    skill: 'Digital Marketing',
    category: 'Marketing & Advertising',
    description: 'Help businesses grow through online marketing and advertising',
    averageEarning: '₱10,000-30,000 per month per client',
    timeToLearn: '3-6 months for comprehensive skills',
    resources: [
      {
        title: 'Digital Marketing Full Course',
        url: 'https://www.youtube.com/watch?v=nU-IIXBWlS4',
        type: 'YouTube',
        provider: 'Simplilearn',
        difficulty: 'Beginner',
        duration: '11 hours',
        isFree: true,
        language: 'English',
        description: 'Complete digital marketing training from basics to advanced',
        tags: ['marketing', 'comprehensive', 'strategy']
      },
      {
        title: 'Google Digital Garage - Free Certification',
        url: 'https://learndigital.withgoogle.com/digitalgarage',
        type: 'Course',
        provider: 'Google',
        difficulty: 'Beginner',
        isFree: true,
        language: 'English',
        description: 'Free digital marketing certification from Google',
        tags: ['google', 'certification', 'free']
      },
      {
        title: 'Facebook Ads Tutorial 2024',
        url: 'https://www.youtube.com/watch?v=_DqdOWVMXxE',
        type: 'YouTube',
        provider: 'Ben Heath',
        difficulty: 'Intermediate',
        duration: '1 hour',
        isFree: true,
        language: 'English',
        description: 'Master Facebook and Instagram advertising',
        tags: ['facebook ads', 'advertising', 'social media']
      },
      {
        title: 'SEO Tutorial for Beginners',
        url: 'https://www.youtube.com/watch?v=DvwS7cV9GmQ',
        type: 'YouTube',
        provider: 'Ahrefs',
        difficulty: 'Beginner',
        duration: '1.5 hours',
        isFree: true,
        language: 'English',
        description: 'Complete guide to Search Engine Optimization',
        tags: ['seo', 'google', 'search']
      },
      {
        title: 'HubSpot Academy - Free Marketing Courses',
        url: 'https://academy.hubspot.com/',
        type: 'Platform',
        provider: 'HubSpot',
        difficulty: 'All Levels',
        isFree: true,
        language: 'English',
        description: 'Multiple free marketing certifications',
        tags: ['certification', 'comprehensive', 'inbound']
      }
    ]
  }
}

/**
 * Search for learning resources based on skill keywords
 */
export function findLearningResources(skillQuery: string): SkillCategory[] {
  const query = skillQuery.toLowerCase()
  const matches: SkillCategory[] = []

  // Search through all skills
  Object.values(learningResourcesDatabase).forEach(skillCategory => {
    const skillLower = skillCategory.skill.toLowerCase()
    const categoryLower = skillCategory.category.toLowerCase()
    const descriptionLower = skillCategory.description.toLowerCase()

    // Check if query matches skill name, category, or description
    if (skillLower.includes(query) || 
        categoryLower.includes(query) || 
        descriptionLower.includes(query) ||
        query.includes(skillLower.split(' ')[0])) {
      matches.push(skillCategory)
    }
  })

  return matches
}

/**
 * Get all available skills for browsing
 */
export function getAllSkills(): string[] {
  return Object.values(learningResourcesDatabase).map(skill => skill.skill)
}

/**
 * Get popular/recommended skills for beginners
 */
export function getBeginnerFriendlySkills(): SkillCategory[] {
  return [
    learningResourcesDatabase.virtualAssistant,
    learningResourcesDatabase.contentWriting,
    learningResourcesDatabase.onlineTutoring,
    learningResourcesDatabase.graphicDesign,
    learningResourcesDatabase.socialMediaManagement
  ]
}
