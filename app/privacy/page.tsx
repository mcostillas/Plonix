'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PiggyBank, ArrowLeft, Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50/30 to-green-50/30">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/auth/register"
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Register</span>
          </Link>
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">Plounix</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: October 12, 2025</p>
        </div>

        <Card className="p-8 shadow-lg mb-8">
          <div className="prose prose-gray max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-primary" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Plounix's Privacy Policy. We respect your privacy and are committed to protecting your personal 
                data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                use our platform.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Plounix complies with the <strong>Philippine Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and 
                follows best practices in data protection. By using Plounix, you consent to the data practices described in 
                this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Database className="w-6 h-6 mr-2 text-primary" />
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account or use Plounix, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                <li><strong>Profile Information:</strong> Age preferences, onboarding responses, user preferences (theme, language)</li>
                <li><strong>Financial Data:</strong> Income, expenses, savings goals, transaction details with categories, monthly bills, scheduled payments</li>
                <li><strong>AI Conversations:</strong> Messages exchanged with Fili (your AI financial coach), including web search queries and results</li>
                <li><strong>Learning Progress:</strong> Completed modules, reflection answers, action items, quiz responses</li>
                <li><strong>Goal Data:</strong> Financial goals, target amounts, deadlines, progress updates, savings contributions</li>
                <li><strong>Challenge Participation:</strong> Active challenges, check-ins, completion status, points earned</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you access Plounix, we automatically collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform, click patterns, navigation flow</li>
                <li><strong>Device Information:</strong> Browser type, operating system, device model, screen resolution, IP address</li>
                <li><strong>Log Data:</strong> Access times, error logs, performance data, API calls</li>
                <li><strong>Cookies & Local Storage:</strong> Session tokens, authentication cookies, preference cookies, onboarding status, tour completion</li>
                <li><strong>Interaction Data:</strong> Button clicks, form submissions, modal interactions, feature usage patterns</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Third-Party Information</h3>
              <p className="text-gray-700 leading-relaxed">
                We may receive information from third-party services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
                <li><strong>Web Search Results:</strong> Real-time financial information, prices, and news from web searches conducted through our AI assistant</li>
                <li><strong>Social Login:</strong> Information from social media login providers (if you choose to use them in the future)</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-primary" />
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your personal information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Provide Services:</strong> Deliver Fili AI financial coach with web search, expense tracking, learning modules, goal tracking, and money missions</li>
                <li><strong>Personalization:</strong> Tailor content, recommendations, and AI responses based on your financial profile and goals</li>
                <li><strong>Account Management:</strong> Create and manage your account, authenticate users, handle onboarding</li>
                <li><strong>Communication:</strong> Send updates, learning content, challenge reminders, goal progress notifications, and support responses</li>
                <li><strong>Analytics:</strong> Understand usage patterns, improve features, fix bugs, optimize user experience</li>
                <li><strong>Security:</strong> Detect fraud, prevent abuse, ensure platform security and data integrity</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations and protect our rights</li>
                <li><strong>AI Training:</strong> Improve AI models and responses (anonymized and aggregated data only)</li>
                <li><strong>Gamification:</strong> Track challenge progress, award points, and provide achievement notifications</li>
              </ul>
            </section>

            {/* AI and Machine Learning */}
            <section className="mb-8 bg-blue-50 border-l-4 border-blue-400 p-6 rounded">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. AI and Machine Learning</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Plounix uses advanced AI technology (powered by OpenRouter and other providers) to deliver personalized financial guidance:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Your conversations with Fili (AI assistant) are processed to generate contextually relevant responses</li>
                <li>We store conversation history to provide context-aware and personalized assistance</li>
                <li>Your data may be sent to third-party AI providers (OpenRouter, OpenAI) for processing</li>
                <li>Fili has real-time web search capabilities to provide current financial information, prices, and bank rates</li>
                <li>Web search queries and results are processed to enhance AI responses</li>
                <li>We implement measures to anonymize sensitive data before AI processing where possible</li>
                <li>AI-generated advice is for educational purposes only, not professional financial advice</li>
              </ul>
              <p className="text-gray-700 leading-relaxed font-medium">
                Note: Third-party AI providers have their own privacy policies. We select vendors with strong data 
                protection practices and compliance standards.
              </p>
            </section>

            {/* Data Sharing and Disclosure */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do NOT sell your personal information. We may share your data in the following limited circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We work with trusted third-party service providers who assist in operating Plounix:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Supabase:</strong> Database, authentication, and backend services</li>
                <li><strong>OpenRouter:</strong> AI routing and language models for chatbot functionality</li>
                <li><strong>OpenAI:</strong> AI language models and processing</li>
                <li><strong>Vercel:</strong> Cloud hosting and deployment infrastructure</li>
                <li><strong>Web Search APIs:</strong> Real-time financial information and news retrieval</li>
                <li><strong>Analytics:</strong> Usage analytics and performance monitoring tools</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                These providers are contractually obligated to protect your data and only use it for specified purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may disclose your information if required by law, court order, or government request.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the 
                new entity.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-primary" />
                6. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Encryption:</strong> Data is encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Authentication:</strong> Secure password hashing (bcrypt) and JWT tokens</li>
                <li><strong>Access Controls:</strong> Role-based access, principle of least privilege</li>
                <li><strong>Monitoring:</strong> Continuous security monitoring and logging</li>
                <li><strong>Regular Updates:</strong> Security patches and vulnerability assessments</li>
                <li><strong>Data Backups:</strong> Regular backups with encryption</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                While we take reasonable precautions, no method of transmission over the internet is 100% secure. 
                We cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <UserCheck className="w-6 h-6 mr-2 text-primary" />
                7. Your Privacy Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under the Philippine Data Privacy Act, you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Object:</strong> Object to certain types of data processing</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing</li>
                <li><strong>Right to Lodge Complaint:</strong> File a complaint with the National Privacy Commission</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, contact us at <strong>privacy@plounix.com</strong>. We will respond within 
                30 days.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide you with Plounix services</li>
                <li>Comply with legal obligations (tax, accounting, etc.)</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                When you delete your account, we will delete or anonymize your personal data within 90 days, except 
                where retention is required by law.
              </p>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Plounix uses cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Essential Cookies:</strong> Required for authentication and platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Track usage patterns and improve user experience</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings. Note that disabling essential cookies may affect 
                platform functionality.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-yellow-600" />
                10. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Plounix is designed for users aged 13 and above. If you are under 18, we recommend using Plounix with 
                parental guidance.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We do not knowingly collect personal information from children under 13. If you believe we have 
                inadvertently collected such information, please contact us immediately at <strong>privacy@plounix.com</strong>.
              </p>
            </section>

            {/* International Users */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Users</h2>
              <p className="text-gray-700 leading-relaxed">
                Plounix is based in the Philippines. If you access our platform from outside the Philippines, your 
                information may be transferred to, stored, and processed in the Philippines or other countries where 
                our service providers operate. By using Plounix, you consent to such transfers.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes via email 
                or through a prominent notice on the platform. Your continued use of Plounix after changes constitutes 
                acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Data Protection Officer:</strong> privacy@plounix.com</p>
                <p className="text-gray-700"><strong>General Support:</strong> support@plounix.com</p>
                <p className="text-gray-700"><strong>Website:</strong> www.plounix.com</p>
                <p className="text-gray-700 mt-3">
                  <strong>National Privacy Commission:</strong><br />
                  For complaints or concerns about data privacy, you may contact the Philippine National Privacy 
                  Commission at <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer" 
                  className="text-primary hover:underline">www.privacy.gov.ph</a>
                </p>
              </div>
            </section>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/terms">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Terms & Conditions
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" className="w-full sm:w-auto">
              I Understand - Create Account
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>We are committed to protecting your privacy and handling your data responsibly.</p>
        </div>
      </div>
    </div>
  )
}
