import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Privacy Policy
            </CardTitle>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Information We Collect
                </h2>
                <p className="text-gray-700 mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  use our AI-powered recruitment services, or contact us for support. This may include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Professional information including job titles and company details</li>
                  <li>LinkedIn account information when you choose to integrate</li>
                  <li>Recruitment data including candidate profiles and job postings</li>
                  <li>Usage data and analytics to improve our services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  How We Use Your Information
                </h2>
                <p className="text-gray-700 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Provide and improve our AI-powered recruitment platform</li>
                  <li>Process and analyze candidate data for job matching</li>
                  <li>Generate AI-powered job advertisements and candidate evaluations</li>
                  <li>Communicate with you about our services</li>
                  <li>Ensure platform security and prevent unauthorized access</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Data Storage and Security
                </h2>
                <p className="text-gray-700 mb-4">
                  We take data security seriously and implement appropriate technical and organizational 
                  measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>All data is stored securely using industry-standard encryption</li>
                  <li>Access to personal data is restricted to authorized personnel only</li>
                  <li>We use Supabase for secure database management with row-level security</li>
                  <li>Regular security audits and monitoring are conducted</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  AI and Data Processing
                </h2>
                <p className="text-gray-700 mb-4">
                  Our platform uses Azure AI Foundry for candidate evaluation and job matching. 
                  We ensure that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>AI processing is conducted with respect for privacy and fairness</li>
                  <li>Candidate data used for AI training is anonymized when possible</li>
                  <li>You maintain control over how your data is used in AI processes</li>
                  <li>AI decisions can be reviewed and contested by users</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Third-Party Integrations
                </h2>
                <p className="text-gray-700 mb-4">
                  Our platform integrates with third-party services including LinkedIn. When you connect 
                  these services, their respective privacy policies also apply. We only access the minimum 
                  data necessary to provide our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Your Rights
                </h2>
                <p className="text-gray-700 mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Access, update, or delete your personal information</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of certain data processing activities</li>
                  <li>Withdraw consent for data processing where applicable</li>
                  <li>Lodge a complaint with relevant data protection authorities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Contact Us
                </h2>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us through the platform or at your organization&apos;s designated 
                  privacy contact.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Changes to This Policy
                </h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of any 
                  material changes by posting the new Privacy Policy on this page and updating 
                  the "Last updated" date.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;