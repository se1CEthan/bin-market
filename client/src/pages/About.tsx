import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Award, 
  Globe, 
  Zap,
  CheckCircle,
  Star,
  Target,
  Heart,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { Link } from 'wouter';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* SEO Meta Tags */}
      <title>About SelTech - Leading Automation Bot Marketplace | Trusted by 10,000+ Developers</title>
      
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Award className="w-4 h-4 mr-2" />
            Trusted by 10,000+ Developers Worldwide
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Revolutionizing Automation
            <br />
            <span className="text-foreground">One Bot at a Time</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            SelTech is the world's leading marketplace for automation bots, connecting innovative developers 
            with businesses seeking cutting-edge automation solutions. Since 2024, we've facilitated over 
            $2M in transactions while maintaining the highest standards of security and trust.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/bots">
              <Button size="lg" className="w-full sm:w-auto">
                <Rocket className="w-5 h-5 mr-2" />
                Explore Marketplace
              </Button>
            </Link>
            <Link href="/developers">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Users className="w-5 h-5 mr-2" />
                Join as Developer
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Developers</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-sm text-muted-foreground">Bots Deployed</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">$2M+</div>
              <div className="text-sm text-muted-foreground">Developer Earnings</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">4.9★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl sm:text-3xl font-bold">Our Mission</h2>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">
                    To democratize automation by creating the world's most trusted marketplace 
                    where developers can monetize their innovations and businesses can access 
                    cutting-edge automation solutions with confidence.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Empowering developers with 90% revenue share</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Providing businesses with verified, secure solutions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Building the future of automated workflows</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 text-center">
                    <Lightbulb className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Innovation First</h3>
                    <p className="text-muted-foreground">
                      We believe in the power of automation to transform businesses and improve lives.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and shape the SelTech experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">Security First</h3>
                <p className="text-muted-foreground">
                  Every bot is thoroughly vetted, and all transactions are secured with 
                  enterprise-grade encryption and fraud protection.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Heart className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">Developer Success</h3>
                <p className="text-muted-foreground">
                  We're committed to developer success with industry-leading revenue share, 
                  comprehensive support, and powerful tools.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously evolve our platform with cutting-edge features, 
                  AI-powered recommendations, and seamless integrations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">Global Reach</h3>
                <p className="text-muted-foreground">
                  Supporting developers and businesses worldwide with multi-currency 
                  payments and localized experiences.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Star className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">Quality Excellence</h3>
                <p className="text-muted-foreground">
                  Rigorous quality standards ensure every bot meets our high benchmarks 
                  for performance, reliability, and user experience.
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-3">Continuous Growth</h3>
                <p className="text-muted-foreground">
                  We're always improving, learning from our community, and pushing 
                  the boundaries of what's possible in automation.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <Users className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Built by Automation Experts</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                Our team combines decades of experience in automation, marketplace development, 
                and developer tools. We understand the challenges because we've lived them, 
                and we're passionate about solving them for the global developer community.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div>
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <div className="text-sm text-muted-foreground">Years Combined Experience</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Automation Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Developer Support</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Join the Revolution?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Whether you're a developer looking to monetize your skills or a business 
                seeking automation solutions, SelTech is your gateway to the future.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Rocket className="w-5 h-5 mr-2" />
                    Get Started Today
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Contact Our Team
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