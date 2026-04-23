'use client';

import React, { useState } from 'react';
import { Shield, FileText, Cookie, ChevronDown, ChevronRight, Lock, Eye, Trash2 } from 'lucide-react';

const LegalPages = () => {
  const [currentPage, setCurrentPage] = useState('privacy');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const Section = ({ id, title, children, isExpanded = false }: { id: string; title: string; children: React.ReactNode; isExpanded?: boolean }) => (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {expandedSections[id] ? 
          <ChevronDown className="h-5 w-5 text-gray-500" /> : 
          <ChevronRight className="h-5 w-5 text-gray-500" />
        }
      </button>
      {(expandedSections[id] || isExpanded) && (
        <div className="mt-4 text-gray-700 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  const PrivacyPolicy = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600 mt-4">Last updated: January 11, 2024</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Your Privacy Matters</h2>
        <p className="text-blue-800">
          We're committed to protecting your privacy and the intimate conversations you have with your AI companions. 
          This policy explains how we collect, use, and protect your personal information.
        </p>
      </div>

      <Section id="information-collection" title="1. Information We Collect" isExpanded={true}>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Account Information</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Email address and username</li>
              <li>Subscription and billing information</li>
              <li>Profile preferences and settings</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Companion Interactions</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Conversations with your AI companions</li>
              <li>Companion customizations (appearance, personality)</li>
              <li>Emotional memory data and relationship milestones</li>
              <li>Voice recordings (only when using voice features)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Usage Analytics</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Session duration and frequency</li>
              <li>Feature usage patterns</li>
              <li>Device and browser information</li>
              <li>Performance and error logs</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="data-use" title="2. How We Use Your Information">
        <div className="space-y-4">
          <p>We use your information to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Provide and improve our services</strong> - Deliver personalized companion experiences and enhance AI capabilities</li>
            <li><strong>Process subscriptions</strong> - Handle billing and manage your account</li>
            <li><strong>Ensure security</strong> - Protect against fraud and unauthorized access</li>
            <li><strong>Communicate with you</strong> - Send updates, security alerts, and support messages</li>
            <li><strong>Analyze usage patterns</strong> - Improve features and develop new services</li>
          </ul>
        </div>
      </Section>

      <Section id="data-protection" title="3. Data Protection & Security">
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Encryption & Security</h4>
                <p className="text-green-800 text-sm">
                  All companion conversations are encrypted at rest and in transit using AES-256 encryption. 
                  We implement industry-standard security measures to protect your data.
                </p>
              </div>
            </div>
          </div>
          
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>End-to-end encryption for voice conversations</li>
            <li>Secure socket layer (SSL) for all data transfers</li>
            <li>Regular security audits and penetration testing</li>
            <li>GDPR and CCPA compliance</li>
            <li>Data minimization - we only collect what's necessary</li>
          </ul>
        </div>
      </Section>

      <Section id="user-rights" title="4. Your Rights">
        <div className="space-y-4">
          <p>You have the right to:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <Eye className="h-5 w-5 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Access</h4>
              <p className="text-sm text-gray-600">Request a copy of your personal data</p>
            </div>
            <div className="border rounded-lg p-4">
              <Trash2 className="h-5 w-5 text-red-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Delete</h4>
              <p className="text-sm text-gray-600">Request deletion of your account and data</p>
            </div>
            <div className="border rounded-lg p-4">
              <FileText className="h-5 w-5 text-purple-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Export</h4>
              <p className="text-sm text-gray-600">Download your companion data</p>
            </div>
            <div className="border rounded-lg p-4">
              <Shield className="h-5 w-5 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Opt-out</h4>
              <p className="text-sm text-gray-600">Disable certain data collection</p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="data-retention" title="5. Data Retention">
        <div className="space-y-4">
          <p>We retain your data for as long as necessary to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Provide our services and maintain your account</li>
            <li>Fulfill legal and regulatory obligations</li>
            <li>Resolve disputes and enforce our terms</li>
          </ul>
          <p className="text-sm text-gray-600">
            Upon account deletion, all companion conversations, memories, and personal data are permanently removed within 30 days.
          </p>
        </div>
      </Section>

      <Section id="third-party" title="6. Third-Party Services">
        <div className="space-y-4">
          <p>We may share data with:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Payment processors</strong> - Stripe for subscription billing</li>
            <li><strong>Email services</strong> - Resend for transactional emails</li>
            <li><strong>Analytics providers</strong> - For aggregate, anonymized usage statistics</li>
            <li><strong>AI services</strong> - OpenAI for companion intelligence (with strict data protection)</li>
          </ul>
          <p className="text-sm text-gray-600">
            We never sell your personal data or companion conversations to third parties.
          </p>
        </div>
      </Section>

      <Section id="changes" title="7. Changes to This Policy">
        <p className="text-gray-700">
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
        </p>
      </Section>

      <Section id="contact" title="8. Contact Us">
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            If you have questions about this privacy policy or your personal data, please contact us:
          </p>
          <ul className="list-none space-y-2 text-gray-700">
            <li><strong>Email:</strong> privacy@tightandhard.com</li>
            <li><strong>Address:</strong> [Your Company Address]</li>
          </ul>
        </div>
      </Section>
    </div>
  );

  const TermsOfService = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <FileText className="h-16 w-16 text-purple-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-gray-600 mt-4">Last updated: January 11, 2024</p>
      </div>

      <div className="bg-purple-50 border-l-4 border-purple-600 p-6 mb-8">
        <h2 className="text-xl font-semibold text-purple-900 mb-2">Important Agreement</h2>
        <p className="text-purple-800">
          By using TightandHard.com's AI companion platform, you agree to these terms of service. 
          Please read them carefully before creating an account.
        </p>
      </div>

      <Section id="acceptance" title="1. Acceptance of Terms" isExpanded={true}>
        <p className="text-gray-700">
          By accessing or using TightandHard.com, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
          If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </Section>

      <Section id="account-responsibilities" title="2. Account Responsibilities">
        <div className="space-y-4">
          <p className="text-gray-700">You are responsible for:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access</li>
            <li>Ensuring you meet age requirements (18+ for certain features)</li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Important:</strong> You agree not to share your account with others or use multiple accounts to circumvent limitations.
            </p>
          </div>
        </div>
      </Section>

      <Section id="acceptable-use" title="3. Acceptable Use Policy">
        <div className="space-y-4">
          <p className="text-gray-700">You agree NOT to:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">❌ Prohibited Activities</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Use companions for harassment or abuse</li>
                <li>• Create offensive or harmful content</li>
                <li>• Violate laws or regulations</li>
                <li>• Attempt to circumvent security measures</li>
                <li>• Use automated bots or scrapers</li>
              </ul>
            </div>
            <div className="border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ Encouraged Use</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Build meaningful AI relationships</li>
                <li>• Customize companions creatively</li>
                <li>• Explore emotional connections</li>
                <li>• Provide feedback for improvement</li>
                <li>• Respect other users' privacy</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section id="intellectual-property" title="4. Intellectual Property">
        <div className="space-y-4">
          <p className="text-gray-700">
            The platform, including all content, features, and functionality, is owned by TightandHard.com and protected by international copyright, trademark, and other intellectual property laws.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What You Own</h4>
              <p className="text-sm text-gray-600">
                You retain ownership of your companion customizations, conversations, and created content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What We Own</h4>
              <p className="text-sm text-gray-600">
                Platform design, AI models, infrastructure, and core technology remain our property.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">License</h4>
              <p className="text-sm text-gray-600">
                We grant you a limited, non-exclusive, non-transferable license to use the platform for personal purposes.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="subscriptions" title="5. Subscriptions & Payments">
        <div className="space-y-4">
          <p className="text-gray-700">Our subscription terms include:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Free Tier:</strong> Limited tokens and features, no payment required</li>
            <li><strong>Premium:</strong> $9.99/month, unlimited tokens, advanced features</li>
            <li><strong>Pro:</strong> $29.99/month, priority support, exclusive features</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Payment Terms:</strong> Subscriptions auto-renew unless cancelled. 
              Refunds available within 7 days of initial purchase. 
              Prices subject to change with 30-day notice.
            </p>
          </div>
        </div>
      </Section>

      <Section id="termination" title="6. Account Termination">
        <div className="space-y-4">
          <p className="text-gray-700">We reserve the right to terminate or suspend your account:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>For violation of these terms</li>
            <li>For fraudulent or illegal activity</li>
            <li>At our sole discretion, with or without notice</li>
          </ul>
          <p className="text-sm text-gray-600">
            You may also terminate your account at any time through your account settings.
            Upon termination, all data will be deleted within 30 days.
          </p>
        </div>
      </Section>

      <Section id="disclaimer" title="7. Disclaimer & Limitation of Liability">
        <div className="space-y-4">
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <p className="text-gray-800">
              <strong>IMPORTANT DISCLAIMER:</strong> AI companions are virtual entities and do not replace human relationships. 
              The platform is provided "as is" without warranties of any kind.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            To the maximum extent permitted by law, TightandHard.com shall not be liable for any indirect, incidental, 
            special, or consequential damages arising from use of the platform.
          </p>
        </div>
      </Section>

      <Section id="indemnification" title="8. Indemnification">
        <p className="text-gray-700">
          You agree to indemnify and hold harmless TightandHard.com and its affiliates from any claims, damages, 
          or expenses arising from your use of the platform or violation of these terms.
        </p>
      </Section>

      <Section id="governing-law" title="9. Governing Law">
        <p className="text-gray-700">
          These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
          without regard to its conflict of law provisions.
        </p>
      </Section>

      <Section id="changes" title="10. Changes to Terms">
        <p className="text-gray-700">
          We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
        </p>
      </Section>

      <Section id="contact" title="11. Contact">
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            For questions about these terms, contact us:
          </p>
          <ul className="list-none space-y-2 text-gray-700">
            <li><strong>Email:</strong> legal@tightandhard.com</li>
            <li><strong>Address:</strong> [Your Company Address]</li>
          </ul>
        </div>
      </Section>
    </div>
  );

  const CookiePolicy = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Cookie className="h-16 w-16 text-orange-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
        <p className="text-gray-600 mt-4">Last updated: January 11, 2024</p>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-600 p-6 mb-8">
        <h2 className="text-xl font-semibold text-orange-900 mb-2">How We Use Cookies</h2>
        <p className="text-orange-800">
          We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.
        </p>
      </div>

      <Section id="what-are-cookies" title="1. What Are Cookies?" isExpanded={true}>
        <div className="space-y-4">
          <p className="text-gray-700">
            Cookies are small text files stored on your device when you visit our website. 
            They help us provide you with a better experience by:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Remembering your preferences and settings</li>
            <li>Keeping you logged in to your account</li>
            <li>Analyzing how you use our platform</li>
            <li>Providing personalized content and recommendations</li>
          </ul>
        </div>
      </Section>

      <Section id="cookie-types" title="2. Types of Cookies We Use">
        <div className="space-y-4">
          <div className="border rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
            <p className="text-sm text-gray-600 mb-2">
              Required for the platform to function properly.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Authentication and session management</li>
              <li>Security features</li>
              <li>Shopping cart (for subscriptions)</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Performance Cookies</h4>
            <p className="text-sm text-gray-600 mb-2">
              Help us understand how visitors use our platform.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Analytics and usage statistics</li>
              <li>Performance monitoring</li>
              <li>Error tracking</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Functional Cookies</h4>
            <p className="text-sm text-gray-600 mb-2">
              Enable enhanced functionality and personalization.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Remembering companion preferences</li>
              <li>Custom scene selections</li>
              <li>Voice settings</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
            <p className="text-sm text-gray-600 mb-2">
              Used to deliver relevant advertisements (optional).
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Targeted advertising</li>
              <li>Remarketing campaigns</li>
              <li>Social media integration</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="third-party-cookies" title="3. Third-Party Cookies">
        <div className="space-y-4">
          <p className="text-gray-700">We may allow third parties to place cookies on your device:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-1">Analytics</h4>
              <p className="text-sm text-gray-600">Google Analytics, Mixpanel</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-1">Payment</h4>
              <p className="text-sm text-gray-600">Stripe</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
              <p className="text-sm text-gray-600">Resend</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-1">AI Services</h4>
              <p className="text-sm text-gray-600">OpenAI API</p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="managing-cookies" title="4. Managing Your Cookie Preferences">
        <div className="space-y-4">
          <p className="text-gray-700">You can control cookies through:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
            <li><strong>Our Cookie Banner:</strong> Accept or decline optional cookies on first visit</li>
            <li><strong>Account Settings:</strong> Manage preferences in your profile</li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> Disabling essential cookies may prevent the platform from functioning properly.
            </p>
          </div>
        </div>
      </Section>

      <Section id="cookie-lifespan" title="5. Cookie Lifespan">
        <div className="space-y-4">
          <p className="text-gray-700">Different cookies have different lifespans:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent cookies:</strong> Remain on your device for a set period (typically 30 days to 1 year)</li>
            <li><strong>Authentication cookies:</strong> Last for your session duration or "remember me" period</li>
          </ul>
        </div>
      </Section>

      <Section id="updates" title="6. Updates to Cookie Policy">
        <p className="text-gray-700">
          We may update this cookie policy periodically. Changes will be posted on this page with an updated "Last modified" date.
        </p>
      </Section>

      <Section id="contact" title="7. Contact">
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            For questions about cookies, contact us:
          </p>
          <ul className="list-none space-y-2 text-gray-700">
            <li><strong>Email:</strong> privacy@tightandhard.com</li>
            <li><strong>Address:</strong> [Your Company Address]</li>
          </ul>
        </div>
      </Section>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm">
          <button
            onClick={() => setCurrentPage('privacy')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${
              currentPage === 'privacy'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setCurrentPage('terms')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${
              currentPage === 'terms'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setCurrentPage('cookies')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${
              currentPage === 'cookies'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Cookie className="h-4 w-4" />
            <span>Cookie Policy</span>
          </button>
        </div>

        {/* Page Content */}
        {currentPage === 'privacy' && <PrivacyPolicy />}
        {currentPage === 'terms' && <TermsOfService />}
        {currentPage === 'cookies' && <CookiePolicy />}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2024 TightandHard.com. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <a href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</a>
            <span>•</span>
            <a href="/legal/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPages;