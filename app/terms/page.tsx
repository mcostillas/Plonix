'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PiggyBank, ArrowLeft, FileText, Shield, Users, AlertCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50/30 to-green-50/30">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
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
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-lg text-gray-600">Last updated: October 3, 2025</p>
        </div>

        <Card className="p-8 shadow-lg mb-8">
          <div className="prose prose-gray max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-6 h-6 mr-2 text-primary" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Plounix! These Terms and Conditions ("Terms") govern your access to and use of the Plounix platform, 
                website, and services (collectively, the "Service"). By accessing or using Plounix, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Plounix is a financial literacy and education platform designed for Filipino youth. We provide AI-powered financial 
                assistance, educational content, budgeting tools, and resources to help you build better financial habits.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By creating an account, accessing, or using Plounix, you acknowledge that you have read, understood, and agree 
                to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our Service.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You must be at least 13 years old to use Plounix</li>
                <li>If you are under 18, you should have parental consent</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-primary" />
                3. User Accounts and Registration
              </h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features of Plounix, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent 
                activities, or for any reason at our sole discretion. You may also delete your account at any time through 
                your account settings.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Service Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Plounix provides the following services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>AI Financial Assistant:</strong> Conversational AI-powered guidance on financial topics, budgeting, 
                savings, and investment advice tailored for Filipino youth</li>
                <li><strong>Educational Content:</strong> Learning modules, articles, and resources on financial literacy</li>
                <li><strong>Financial Tools:</strong> Budget calculators, savings trackers, goal setting, and expense management</li>
                <li><strong>Receipt Scanner:</strong> OCR technology to digitize and track expenses from receipts</li>
                <li><strong>Challenges & Gamification:</strong> Interactive challenges to build financial habits</li>
              </ul>
            </section>

            {/* Not Financial Advice */}
            <section className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-yellow-600" />
                5. Important Disclaimer: Not Financial Advice
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4 font-semibold">
                PLOUNIX IS AN EDUCATIONAL PLATFORM. THE INFORMATION, TOOLS, AND AI-GENERATED CONTENT PROVIDED ARE FOR 
                EDUCATIONAL AND INFORMATIONAL PURPOSES ONLY.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Plounix does NOT provide professional financial advice, investment advice, tax advice, or legal advice</li>
                <li>We are NOT licensed financial advisors, accountants, or investment professionals</li>
                <li>All content is for general educational purposes and should not be considered personalized financial advice</li>
                <li>You should consult with qualified professionals before making any financial decisions</li>
                <li>Past performance or examples do not guarantee future results</li>
                <li>Plounix is not responsible for any financial losses or decisions made based on information from our platform</li>
              </ul>
            </section>

            {/* User Conduct */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Conduct and Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree NOT to use Plounix to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights of Plounix or others</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Impersonate others or provide false information</li>
                <li>Use the Service for commercial purposes without authorization</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on Plounix, including but not limited to text, graphics, logos, icons, images, audio clips, 
                digital downloads, data compilations, and software, is the property of Plounix or its content suppliers 
                and is protected by Philippine and international copyright laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may not reproduce, distribute, modify, create derivative works, publicly display, or exploit any content 
                from Plounix without express written permission.
              </p>
            </section>

            {/* Privacy and Data */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our{' '}
                <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
                By using Plounix, you consent to our data practices as described in the Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We comply with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and implement appropriate 
                security measures to protect your personal information.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Plounix is provided "AS IS" and "AS AVAILABLE" without warranties of any kind</li>
                <li>We do not guarantee the accuracy, completeness, or timeliness of information on the platform</li>
                <li>We are not liable for any direct, indirect, incidental, consequential, or punitive damages</li>
                <li>We are not responsible for financial losses resulting from use of our Service</li>
                <li>Our total liability shall not exceed the amount you paid to use Plounix (if any)</li>
              </ul>
            </section>

            {/* Modifications */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email 
                or through the platform. Continued use of Plounix after changes constitutes acceptance of the modified Terms. 
                We recommend reviewing these Terms periodically.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law and Jurisdiction</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines. 
                Any disputes arising from these Terms or use of Plounix shall be subject to the exclusive jurisdiction of the 
                courts of the Philippines.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> legal@plounix.com</p>
                <p className="text-gray-700"><strong>Support:</strong> support@plounix.com</p>
                <p className="text-gray-700"><strong>Website:</strong> www.plounix.com</p>
              </div>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or 
                eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
              </p>
            </section>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/privacy">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Privacy Policy
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" className="w-full sm:w-auto">
              I Agree - Create Account
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By using Plounix, you acknowledge that you have read and understood these Terms and Conditions.</p>
        </div>
      </div>
    </div>
  )
}
