/**
 * Advanced Footer Component
 * Revolutionary footer with dynamic content and interactive elements
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart, 
  Zap, 
  TrendingUp, 
  Users, 
  Bot, 
  Shield, 
  Globe, 
  Rocket,
  ArrowUp,
  Star,
  MessageCircle,
  Coffee
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLiveStats } from '@/lib/live-data';
import logoUrl from '@assets/bin-high-resolution-logo-transparent_1763235895212.png';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { stats } = useLiveStats();

  // Show scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    product: [
      { name: 'Explore Bots', href: '/bots' },
      { name: 'Categories', href: '/categories' },
      { name: 'Trending', href: '/trending' },
      { name: 'New Releases', href: '/new' },
      { name: 'Top Rated', href: '/top-rated' },
    ],
    developers: [
      { name: 'Upload Bot', href: '/developer/upload' },
      { name: 'Developer Guide', href: '/docs/developer' },
      { name: 'API Documentation', href: '/docs/api' },
      { name: 'SDK & Tools', href: '/developer/tools' },
      { name: 'Revenue Sharing', href: '/developer/revenue' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Bug Reports', href: '/bugs' },
      { name: 'Feature Requests', href: '/features' },
      { name: 'Community Forum', href: '/community' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Blog', href: '/blog' },
      { name: 'Investors', href: '/investors' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'DMCA', href: '/dmca' },
      { name: 'Security', href: '/security' },
    ],
  };

  return (
    <>
      <footer className="relative bg-gradient-to-br from-background via-muted/20 to-background border-t border-border/50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_theme(colors.primary)_1px,_transparent_0)] bg-[size:20px_20px]" />
        </div>

        <div className="relative">
          {/* Stats Section */}
          <motion.div 
            className="border-b border-border/30 py-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="container mx-auto px-4 md:px-6">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Bot className="w-6 h-6 text-primary mr-2" />
                      <motion.div 
                        className="text-3xl font-bold text-primary"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stats.totalBots.toLocaleString()}
                      </motion.div>
                    </div>
                    <div className="text-sm text-muted-foreground">Total Bots</div>
                  </motion.div>

                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-green-500 mr-2" />
                      <motion.div 
                        className="text-3xl font-bold text-green-500"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        {stats.totalUsers.toLocaleString()}
                      </motion.div>
                    </div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </motion.div>

                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="w-6 h-6 text-blue-500 mr-2" />
                      <motion.div 
                        className="text-3xl font-bold text-blue-500"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        {stats.totalDownloads.toLocaleString()}
                      </motion.div>
                    </div>
                    <div className="text-sm text-muted-foreground">Downloads</div>
                  </motion.div>

                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-6 h-6 text-yellow-500 mr-2" />
                      <motion.div 
                        className="text-3xl font-bold text-yellow-500"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                      >
                        {stats.averageRating.toFixed(1)}
                      </motion.div>
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Newsletter Section */}
          <motion.div 
            className="border-b border-border/30 py-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="container mx-auto px-4 md:px-6">
              <div className="max-w-2xl mx-auto text-center">
                <motion.div
                  className="mb-6"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">Stay in the Loop</h3>
                <p className="text-muted-foreground mb-6">
                  Get the latest bot releases, developer insights, and platform updates delivered to your inbox.
                </p>
                
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    >
                      Subscribe
                    </Button>
                  </motion.div>
                </form>
                
                <AnimatePresence>
                  {isSubscribed && (
                    <motion.div
                      className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>Thanks for subscribing! Check your email for confirmation.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Main Footer Content */}
          <div className="py-12">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
                {/* Brand Section */}
                <motion.div 
                  className="lg:col-span-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Link href="/">
                    <motion.div 
                      className="flex items-center gap-3 mb-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img src={logoUrl} alt="BIN Logo" className="h-12 w-auto" />
                      <div>
                        <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          BIN Market
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Bot Intelligence Network
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                  
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    The world's largest marketplace for automation bots. Discover, purchase, and deploy 
                    intelligent automation solutions that transform your workflow.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <motion.a
                      href="https://github.com/se1CEthan/bin-market"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Github className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      href="#"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Twitter className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      href="#"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Linkedin className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      href="mailto:support@binmarket.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Mail className="w-5 h-5" />
                    </motion.a>
                  </div>
                </motion.div>

                {/* Footer Links */}
                {Object.entries(footerLinks).map(([category, links], index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h4 className="font-semibold mb-4 capitalize text-foreground">
                      {category === 'product' ? 'Product' :
                       category === 'developers' ? 'Developers' :
                       category === 'support' ? 'Support' :
                       category === 'company' ? 'Company' : 'Legal'}
                    </h4>
                    <ul className="space-y-2">
                      {links.map((link) => (
                        <li key={link.name}>
                          <motion.div whileHover={{ x: 5 }}>
                            <Link 
                              href={link.href}
                              className="text-muted-foreground hover:text-primary transition-colors text-sm"
                            >
                              {link.name}
                            </Link>
                          </motion.div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <motion.div 
            className="border-t border-border/30 py-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>© 2024 BIN Market. All rights reserved.</span>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <span>Made with</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    </motion.div>
                    <span>by developers, for developers</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>Global</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Fast</span>
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="fixed bottom-6 right-6 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Support Chat Button */}
      <motion.button
        className="fixed bottom-6 left-6 z-40 p-3 bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: [
            "0 0 0 0 rgba(34, 197, 94, 0.7)",
            "0 0 0 10px rgba(34, 197, 94, 0)",
            "0 0 0 0 rgba(34, 197, 94, 0)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageCircle className="w-5 h-5" />
      </motion.button>
    </>
  );
}