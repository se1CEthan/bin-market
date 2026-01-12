import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Eye, 
  Lock, 
  Users, 
  Globe, 
  FileText,
  CheckCircle,
  AlertCircle,
  Settings,
  Download,
  Mail,
  Trash2
} from 'lucide-react';
import { Link } from 'wouter';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* SEO Meta Tags */}
      <title>Privacy Policy - SelTech | GDPR Compliant Data Protection & User Privacy</title>
      
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="w-4 h-4 mr-2" />
            GDPR Compliant • Last Updated: January 11, 2025
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Privacy Matters
            </span>
            <br />
            <span className="text-foreground">We Protect Your Data</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            At SelTech, we are committed to protecting your privacy and ensuring transparent 
            data practices. This policy explains how we collect, use, and safeguard your 
            personal information in compliance with GDPR, CCPA, and other privacy regulations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto">
                <Mail className="w-5 h-5 mr-2" />
                Contact Privacy Team
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Download className="w-5 h-5 mr-2" />
              Download Privacy Policy
            </Button>
          </div>
        </motion.div>

        {/* Privacy Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <Card className="text-center border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <Lock className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Data Minimization</h3>
              <p className="text-muted-foreground">
                We only collect data that is necessary for providing our services and improving your experience.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="text-muted-foreground">
                Clear, understandable information about what data we collect and how we use it.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-purple-200 bg-purple-50/50">
            <CardContent className="p-6">
              <Settings className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">User Control</h3>
              <p className="text-muted-foreground">
                Full control over your data with easy access, correction, and deletion options.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="w-6 h-6 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Account Information
                </h3>
                <ul className="space-y-2 text-muted-foreground ml-7">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Name and email address (required for account creation)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Profile information (optional bio, avatar, social links)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Developer verification documents (for sellers only)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Payment information (processed securely by third parties)
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Usage Information
                </h3>
                <ul className="space-y-2 text-muted-foreground ml-7">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Pages visited and features used (for improving user experience)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Search queries and bot interactions (to enhance recommendations)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Device information and IP address (for security and analytics)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Cookies and similar technologies (with your consent)
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-600" />
                  Communication Data
                </h3>
                <ul className="space-y-2 text-muted-foreground ml-7">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Support tickets and customer service interactions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Reviews and ratings you provide
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Messages between users (encrypted and not monitored)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How We Use Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Settings className="w-6 h-6 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Provision</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Account management and authentication
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Processing transactions and payments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Providing customer support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Delivering purchased bots and services
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Platform Improvement</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Personalizing your experience
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Improving search and recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Analyzing usage patterns and trends
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Developing new features and services
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security & Compliance</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Fraud prevention and detection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Security monitoring and threat prevention
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Legal compliance and regulatory requirements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Enforcing terms of service and policies
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Communication</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Service updates and notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Marketing communications (with consent)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Important security and policy updates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Responding to your inquiries and requests
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Your Privacy Rights</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  You have full control over your personal data. Exercise your rights easily through our platform.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Eye className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Access Your Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Request a copy of all personal data we have about you
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Request Data Export
                  </Button>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Settings className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Correct Information</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Update or correct any inaccurate personal information
                  </p>
                  <Link href="/account/settings">
                    <Button variant="outline" size="sm" className="w-full">
                      Update Profile
                    </Button>
                  </Link>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Trash2 className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Delete Your Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Request complete deletion of your account and data
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Delete Account
                  </Button>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Lock className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Restrict Processing</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Limit how we process your personal information
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Preferences
                  </Button>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Download className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Data Portability</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Export your data in a machine-readable format
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Export Data
                  </Button>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Object to Processing</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Object to certain types of data processing
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    File Objection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  Data Security Measures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Encryption</h4>
                    <p className="text-sm text-muted-foreground">
                      AES-256 encryption for data at rest and TLS 1.3 for data in transit
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Access Controls</h4>
                    <p className="text-sm text-muted-foreground">
                      Role-based access with multi-factor authentication for all staff
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Regular Audits</h4>
                    <p className="text-sm text-muted-foreground">
                      Annual security audits and penetration testing by third parties
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Data Minimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatic deletion of unnecessary data and regular cleanup processes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  International Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  When we transfer your data internationally, we ensure adequate protection through:
                </p>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Adequacy Decisions</h4>
                    <p className="text-sm text-muted-foreground">
                      Transfers only to countries with adequate data protection laws
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Standard Contractual Clauses</h4>
                    <p className="text-sm text-muted-foreground">
                      EU-approved contracts ensuring data protection standards
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Data Localization</h4>
                    <p className="text-sm text-muted-foreground">
                      Option to keep your data within specific geographic regions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8 sm:p-12">
              <Mail className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Questions About Privacy?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our privacy team is here to help. Contact us with any questions about 
                your data, privacy rights, or this policy.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="w-full sm:w-auto">
                  <Mail className="w-5 h-5 mr-2" />
                  privacy@seltech.com
                </Button>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Contact Support
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 text-sm text-muted-foreground">
                <p>Data Protection Officer: privacy@seltech.com</p>
                <p>EU Representative: eu-privacy@seltech.com</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}