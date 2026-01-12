import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  Award, 
  Users, 
  Star,
  FileCheck,
  CreditCard,
  Eye,
  Zap,
  Globe,
  HeadphonesIcon,
  TrendingUp,
  Verified
} from 'lucide-react';
import { Link } from 'wouter';

export default function Trust() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* SEO Meta Tags */}
      <title>Trust & Security - SelTech | Enterprise-Grade Security & 99.9% Uptime Guarantee</title>
      
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
            <Shield className="w-4 h-4 mr-2" />
            SOC 2 Type II Compliant • ISO 27001 Certified
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Enterprise-Grade Security
            </span>
            <br />
            <span className="text-foreground">You Can Trust</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            SelTech employs bank-level security measures, comprehensive verification processes, 
            and transparent policies to ensure the highest levels of trust and safety for our 
            global community of 10,000+ developers and businesses.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/security">
              <Button size="lg" className="w-full sm:w-auto">
                <Lock className="w-5 h-5 mr-2" />
                View Security Details
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <HeadphonesIcon className="w-5 h-5 mr-2" />
                Contact Security Team
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          <Card className="text-center border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">$2M+</div>
              <div className="text-sm text-muted-foreground">Secure Transactions</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-purple-200 bg-purple-50/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-sm text-muted-foreground">Security Breaches</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-orange-200 bg-orange-50/50">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Security Monitoring</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Multi-Layer Security Architecture</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive security framework protects every aspect of your experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-all hover:border-green-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">End-to-End Encryption</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  All data is encrypted using AES-256 encryption both in transit and at rest, 
                  ensuring your information remains secure at all times.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Military-grade encryption</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all hover:border-blue-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Bot Verification</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Every bot undergoes rigorous security scanning, malware detection, 
                  and code review before being approved for the marketplace.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Automated + manual review</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all hover:border-purple-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Verified className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Identity Verification</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  All developers undergo KYC verification with government ID validation 
                  and background checks for enhanced trust.
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>KYC + background checks</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all hover:border-orange-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Secure Payments</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  PCI DSS compliant payment processing with fraud detection, 
                  chargeback protection, and instant dispute resolution.
                </p>
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>PCI DSS Level 1 compliant</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all hover:border-red-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Eye className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold">24/7 Monitoring</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Advanced threat detection with AI-powered monitoring, 
                  real-time alerts, and immediate incident response.
                </p>
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>AI-powered threat detection</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all hover:border-teal-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Globe className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Global Compliance</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  GDPR, CCPA, and SOX compliant with data residency options 
                  and comprehensive privacy controls.
                </p>
                <div className="flex items-center gap-2 text-sm text-teal-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Multi-region compliance</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Industry Certifications & Compliance</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  We maintain the highest industry standards and certifications to ensure your trust.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">SOC 2 Type II</h3>
                  <p className="text-sm text-muted-foreground">Security & availability controls</p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Lock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">ISO 27001</h3>
                  <p className="text-sm text-muted-foreground">Information security management</p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">PCI DSS Level 1</h3>
                  <p className="text-sm text-muted-foreground">Payment card security</p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Globe className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">GDPR Compliant</h3>
                  <p className="text-sm text-muted-foreground">Data protection & privacy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Trust Guarantees</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We stand behind our platform with comprehensive guarantees and protections.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-semibold">Money-Back Guarantee</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  If you're not satisfied with a bot purchase, we offer a full refund within 
                  30 days, no questions asked. Your satisfaction is our priority.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>30-day full refund policy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No questions asked</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Instant refund processing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">Security Guarantee</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  We guarantee that all bots are malware-free and secure. If any security 
                  issue is discovered, we provide immediate remediation and compensation.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Malware-free guarantee</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Security vulnerability protection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Immediate issue resolution</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Community Trust */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <Card>
            <CardContent className="p-8 sm:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Trusted by the Community</h2>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">
                    Our reputation is built on the trust of thousands of developers and businesses 
                    who rely on SelTech for their automation needs every day.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold">4.9/5 average rating</span>
                      <span className="text-muted-foreground">from 5,000+ reviews</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="font-semibold">98% customer satisfaction</span>
                      <span className="text-muted-foreground">based on surveys</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">Industry recognition</span>
                      <span className="text-muted-foreground">from leading tech publications</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                  <div className="text-lg font-semibold mb-4">Verified Developers</div>
                  <p className="text-muted-foreground mb-6">
                    Join a community of verified, professional developers who trust SelTech 
                    with their automation solutions and earnings.
                  </p>
                  <Link href="/developers">
                    <Button className="w-full">
                      Join the Community
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8 sm:p-12">
              <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Experience Secure Automation</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of businesses and developers who trust SelTech for secure, 
                reliable automation solutions. Start with confidence today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/bots">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Zap className="w-5 h-5 mr-2" />
                    Explore Secure Bots
                  </Button>
                </Link>
                <Link href="/security">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <FileCheck className="w-5 h-5 mr-2" />
                    Read Security Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}