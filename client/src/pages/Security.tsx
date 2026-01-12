import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Eye, 
  Server, 
  Key, 
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Globe,
  Zap,
  Users,
  Award,
  Download,
  Bug
} from 'lucide-react';
import { Link } from 'wouter';

export default function Security() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* SEO Meta Tags */}
      <title>Security Center - SelTech | SOC 2 Compliant, ISO 27001 Certified Bot Marketplace</title>
      
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 bg-red-100 text-red-800 border-red-200">
            <Shield className="w-4 h-4 mr-2" />
            Security First • Zero Tolerance for Vulnerabilities
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Military-Grade Security
            </span>
            <br />
            <span className="text-foreground">For Your Peace of Mind</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            SelTech implements comprehensive security measures including multi-layer encryption, 
            advanced threat detection, and rigorous compliance standards to protect your data, 
            transactions, and automation solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/trust">
              <Button size="lg" className="w-full sm:w-auto">
                <Award className="w-5 h-5 mr-2" />
                View Trust Center
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Download className="w-5 h-5 mr-2" />
              Download Security Whitepaper
            </Button>
          </div>
        </motion.div>

        {/* Security Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <Card className="text-center border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Zero Breaches</h3>
              <p className="text-muted-foreground">
                Perfect security track record since launch with continuous monitoring and proactive threat prevention.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AES-256 Encryption</h3>
              <p className="text-muted-foreground">
                Military-grade encryption for all data in transit and at rest, ensuring maximum protection.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-purple-200 bg-purple-50/50">
            <CardContent className="p-6">
              <Eye className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Monitoring</h3>
              <p className="text-muted-foreground">
                AI-powered threat detection with real-time monitoring and instant incident response capabilities.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comprehensive Security Architecture</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our multi-layered security approach protects every aspect of the platform.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Infrastructure Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  Infrastructure Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Cloud Infrastructure</h4>
                    <p className="text-sm text-muted-foreground">
                      AWS-hosted with VPC isolation, private subnets, and network ACLs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">DDoS Protection</h4>
                    <p className="text-sm text-muted-foreground">
                      CloudFlare enterprise protection with automatic mitigation
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Load Balancing</h4>
                    <p className="text-sm text-muted-foreground">
                      Auto-scaling with health checks and failover mechanisms
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Backup & Recovery</h4>
                    <p className="text-sm text-muted-foreground">
                      Automated backups with point-in-time recovery capabilities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                  Application Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Secure Development</h4>
                    <p className="text-sm text-muted-foreground">
                      OWASP Top 10 compliance with secure coding practices
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Input Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive input sanitization and SQL injection prevention
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Multi-factor authentication with JWT tokens and session management
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">API Security</h4>
                    <p className="text-sm text-muted-foreground">
                      Rate limiting, API keys, and OAuth 2.0 implementation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Bot Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <Bug className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Bot Security & Verification</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Every bot undergoes rigorous security testing before approval.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <FileCheck className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Malware Scanning</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced malware detection using multiple engines and behavioral analysis
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Eye className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Code Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Manual security review by certified security professionals
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Vulnerability Testing</h3>
                  <p className="text-sm text-muted-foreground">
                    Automated vulnerability scanning and penetration testing
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Key className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Digital Signatures</h3>
                  <p className="text-sm text-muted-foreground">
                    Code signing certificates to verify authenticity and integrity
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Shield className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Sandboxing</h3>
                  <p className="text-sm text-muted-foreground">
                    Isolated testing environment for behavioral analysis
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Real-time Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Continuous monitoring for suspicious activity post-deployment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compliance & Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Compliance & Certifications</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We maintain the highest industry standards and undergo regular audits.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="text-center border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <Award className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">SOC 2 Type II</h3>
                <p className="text-sm text-muted-foreground">
                  Annual audits for security, availability, and confidentiality
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">ISO 27001</h3>
                <p className="text-sm text-muted-foreground">
                  Information security management system certification
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-purple-200 bg-purple-50/50">
              <CardContent className="p-6">
                <Lock className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">PCI DSS Level 1</h3>
                <p className="text-sm text-muted-foreground">
                  Highest level of payment card industry compliance
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-orange-200 bg-orange-50/50">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">GDPR Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Full compliance with European data protection regulations
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Additional Compliance Standards</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>CCPA (California Consumer Privacy Act)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>HIPAA (Healthcare Information Portability)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>SOX (Sarbanes-Oxley Act)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>FERPA (Family Educational Rights)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Team */}
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
                    <h2 className="text-2xl sm:text-3xl font-bold">Dedicated Security Team</h2>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">
                    Our security team consists of certified professionals with decades of 
                    combined experience in cybersecurity, threat detection, and incident response.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">CISSP Certified Security Professionals</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="font-semibold">24/7 Security Operations Center</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-purple-500" />
                      <span className="font-semibold">Continuous Threat Intelligence</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-8 text-center border border-red-200">
                  <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">Report Security Issues</h3>
                  <p className="text-muted-foreground mb-6">
                    Found a security vulnerability? We take all reports seriously and 
                    respond within 24 hours.
                  </p>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Report Vulnerability
                  </Button>
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
              <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Security You Can Trust</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Experience the most secure automation marketplace with enterprise-grade 
                protection, comprehensive compliance, and zero-tolerance security policies.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/bots">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Shield className="w-5 h-5 mr-2" />
                    Explore Secure Bots
                  </Button>
                </Link>
                <Link href="/trust">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Award className="w-5 h-5 mr-2" />
                    Visit Trust Center
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