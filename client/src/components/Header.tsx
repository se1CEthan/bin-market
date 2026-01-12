import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { NotificationBell } from '@/components/NotificationCenter';
import { Search, Upload, User, LogOut, Settings, ShoppingBag, LayoutDashboard, Heart, FolderOpen, GitCompare, Bell, Zap, TrendingUp, Sparkles, Command, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiveStats } from '@/lib/live-data';
import { useDeviceInfo, getResponsiveAnimation } from '@/lib/responsive';
import logoUrl from '@assets/bin-high-resolution-logo-transparent_1763235895212.png';

export function Header() {
  const [location, navigate] = useLocation();
  const { user, login, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { stats: liveStats } = useLiveStats();
  const deviceInfo = useDeviceInfo();
  const animationConfig = getResponsiveAnimation(deviceInfo);

  // Advanced scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Command palette shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/bots?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <motion.header 
        className={cn(
          "sticky top-0 z-50 w-full border-b transition-all duration-300",
          isScrolled 
            ? "border-border/50 bg-background/80 backdrop-blur-xl shadow-lg" 
            : "border-border bg-background/95 backdrop-blur"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Professional Header Container with Consistent Spacing */}
        <div className="flex h-16 sm:h-18 lg:h-20 items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
            <Link href="/">
              <motion.div 
                className="flex items-center rounded-lg p-1 sm:p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" 
                data-testid="link-home"
                whileHover={animationConfig.enabled ? { scale: 1.02 } : {}}
                whileTap={animationConfig.enabled ? { scale: 0.98 } : {}}
              >
                <motion.img 
                  src={logoUrl} 
                  alt="SelTech Logo" 
                  className="h-8 sm:h-10 lg:h-12 w-auto object-contain" 
                  animate={animationConfig.enabled ? { rotate: [0, 1, -1, 0] } : {}}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </Link>

            {/* Professional Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <motion.div 
                whileHover={animationConfig.enabled ? { scale: 1.02 } : {}} 
                whileTap={animationConfig.enabled ? { scale: 0.98 } : {}}
              >
                <Button variant="ghost" size="default" asChild className="px-3 xl:px-4 py-2 h-9 xl:h-10 font-medium text-sm xl:text-base">
                  <Link href="/bots">
                    <Zap className="w-4 h-4 mr-1 xl:mr-2" />
                    <span className="hidden xl:inline">Explore</span>
                    <span className="xl:hidden">Bots</span>
                  </Link>
                </Button>
              </motion.div>
              <motion.div 
                whileHover={animationConfig.enabled ? { scale: 1.02 } : {}} 
                whileTap={animationConfig.enabled ? { scale: 0.98 } : {}}
              >
                <Button variant="ghost" size="default" asChild className="px-3 xl:px-4 py-2 h-9 xl:h-10 font-medium text-sm xl:text-base">
                  <Link href="/trending">
                    <TrendingUp className="w-4 h-4 mr-1 xl:mr-2" />
                    Trending
                  </Link>
                </Button>
              </motion.div>
              <motion.div 
                whileHover={animationConfig.enabled ? { scale: 1.02 } : {}} 
                whileTap={animationConfig.enabled ? { scale: 0.98 } : {}}
              >
                <Button variant="ghost" size="default" asChild className="px-3 xl:px-4 py-2 h-9 xl:h-10 font-medium text-sm xl:text-base">
                  <Link href="/categories">
                    Categories
                  </Link>
                </Button>
              </motion.div>
            </nav>

            {/* Professional Search Bar */}
            <div className="hidden md:block w-full max-w-xs lg:max-w-sm xl:max-w-md relative">
              <AdvancedSearch 
                onSearch={(query, filters) => {
                  const params = new URLSearchParams();
                  if (query) params.append('search', query);
                  filters.forEach(filter => {
                    params.append(filter.type, filter.value);
                  });
                  navigate(`/bots?${params.toString()}`);
                }}
                placeholder="Search automation solutions..."
                className="w-full h-9 lg:h-10 pl-8 lg:pl-10 pr-12 lg:pr-16 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
              <Search className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 h-3 w-3 lg:h-4 lg:w-4 text-slate-400" />
              <motion.div
                className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md"
                initial={animationConfig.enabled ? { opacity: 0 } : {}}
                animate={animationConfig.enabled ? { opacity: 1 } : {}}
                transition={{ delay: 1 }}
              >
                <Command className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                <span className="hidden lg:inline">K</span>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Mobile Search Button */}
            <div className="md:hidden">
              <motion.div
                whileHover={animationConfig.enabled ? { scale: 1.05 } : {}}
                whileTap={animationConfig.enabled ? { scale: 0.95 } : {}}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCommandPalette(true)}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <motion.div
                whileHover={animationConfig.enabled ? { scale: 1.05 } : {}}
                whileTap={animationConfig.enabled ? { scale: 0.95 } : {}}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
                >
                  {showMobileMenu ? (
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </motion.div>
            </div>

            {user ? (
              <>
                {/* Professional Quick Actions */}
                <motion.div 
                  className="hidden lg:flex items-center gap-2 xl:gap-3"
                  initial={animationConfig.enabled ? { opacity: 0, x: 20 } : {}}
                  animate={animationConfig.enabled ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div 
                    whileHover={animationConfig.enabled ? { scale: 1.05 } : {}} 
                    whileTap={animationConfig.enabled ? { scale: 0.95 } : {}}
                  >
                    <Button variant="ghost" size="icon" asChild className="relative h-8 w-8 xl:h-10 xl:w-10 rounded-lg xl:rounded-xl">
                      <Link href="/collections">
                        <Heart className="h-4 w-4 xl:h-5 xl:w-5" />
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 h-4 w-4 xl:h-5 xl:w-5 p-0 text-xs flex items-center justify-center bg-red-500 text-white border-0"
                        >
                          3
                        </Badge>
                      </Link>
                    </Button>
                  </motion.div>
                  
                  <div className="hidden xl:block">
                    <NotificationBell />
                  </div>
                </motion.div>

                {user.isDeveloper && (
                  <motion.div
                    initial={animationConfig.enabled ? { opacity: 0, scale: 0.8 } : {}}
                    animate={animationConfig.enabled ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.4 }}
                    whileHover={animationConfig.enabled ? { scale: 1.02 } : {}}
                    whileTap={animationConfig.enabled ? { scale: 0.98 } : {}}
                  >
                    <Button
                      variant="outline"
                      size="default"
                      asChild
                      className="hidden lg:flex bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 px-2 xl:px-4 py-2 h-8 xl:h-10 font-medium rounded-lg xl:rounded-xl text-xs xl:text-sm"
                      data-testid="button-upload-bot"
                    >
                      <Link href="/developer/upload">
                        <Upload className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2" />
                        <span className="hidden xl:inline">Upload Solution</span>
                        <span className="xl:hidden">Upload</span>
                        <motion.div
                          className="ml-1 xl:ml-2 w-1.5 h-1.5 xl:w-2 xl:h-2 bg-emerald-500 rounded-full"
                          animate={animationConfig.enabled ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </Link>
                    </Button>
                  </motion.div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button variant="ghost" size="icon" className="rounded-lg xl:rounded-xl relative h-8 w-8 sm:h-9 sm:w-9 xl:h-10 xl:w-10" data-testid="button-user-menu">
                        <Avatar className="h-6 w-6 sm:h-7 sm:w-7 xl:h-8 xl:w-8 ring-2 ring-blue-500/20 ring-offset-2">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-xs sm:text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 xl:w-3 xl:h-3 bg-emerald-500 rounded-full border-2 border-background"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 sm:w-72 p-0 rounded-xl shadow-xl border-slate-200 dark:border-slate-700">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-10 w-10 sm:h-14 sm:w-14 ring-2 ring-blue-500/20">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm sm:text-lg font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">{user.name}</span>
                          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{user.email}</span>
                          <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                            <Badge variant="secondary" className="text-xs font-medium">
                              {user.isDeveloper ? 'Developer' : 'User'}
                            </Badge>
                            {user.isAdmin && (
                              <Badge variant="default" className="text-xs font-medium bg-amber-500 hover:bg-amber-600">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    <div className="p-2 sm:p-3 space-y-1">
                      <DropdownMenuItem asChild data-testid="menu-item-account" className="cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Link href="/account" className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-slate-900 dark:text-white text-sm">My Account</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Profile & settings</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild data-testid="menu-item-purchases" className="cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Link href="/account/purchases" className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-slate-900 dark:text-white text-sm">My Purchases</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Downloaded solutions</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Link href="/collections" className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-slate-900 dark:text-white text-sm">Collections</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Saved & wishlist</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Link href="/compare" className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                            <GitCompare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-slate-900 dark:text-white text-sm">Compare Solutions</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Side-by-side analysis</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      {user.isDeveloper && (
                        <DropdownMenuItem asChild data-testid="menu-item-developer" className="cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <Link href="/developer/dashboard" className="flex items-center gap-3 sm:gap-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                              <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium text-slate-900 dark:text-white text-sm">Developer Dashboard</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Manage your solutions</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {user.isAdmin && (
                        <DropdownMenuItem asChild data-testid="menu-item-admin" className="cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <Link href="/admin/dashboard" className="flex items-center gap-3 sm:gap-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium text-slate-900 dark:text-white text-sm">Admin Dashboard</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">Platform management</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </div>
                    
                    <DropdownMenuSeparator className="mx-2 sm:mx-3" />
                    
                    <div className="p-2 sm:p-3">
                      <DropdownMenuItem 
                        onClick={logout} 
                        data-testid="menu-item-logout"
                        className="cursor-pointer rounded-lg p-2 sm:p-3 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center mr-3 sm:mr-4">
                          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <span className="font-medium text-sm">Sign Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <motion.div 
                className="flex items-center gap-2 sm:gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="ghost" asChild data-testid="button-login" className="px-3 sm:px-4 py-2 h-8 sm:h-9 xl:h-10 font-medium rounded-lg xl:rounded-xl text-xs sm:text-sm">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    data-testid="button-get-started"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg px-3 sm:px-4 xl:px-6 py-2 h-8 sm:h-9 xl:h-10 font-semibold rounded-lg xl:rounded-xl text-xs sm:text-sm"
                  >
                    <Link href="/login">
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Start</span>
                      <motion.div
                        className="ml-1 sm:ml-2"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-3 sm:py-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search automation solutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 sm:pl-10 pr-12 sm:pr-16 h-9 sm:h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              data-testid="input-search-mobile"
            />
            <motion.div
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md"
              initial={animationConfig.enabled ? { opacity: 0 } : {}}
              animate={animationConfig.enabled ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              <Command className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">K</span>
            </motion.div>
          </form>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
                <nav className="space-y-1 sm:space-y-2">
                  <Link href="/bots">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm h-9 sm:h-10"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Zap className="w-4 h-4 mr-2 sm:mr-3" />
                      Explore Bots
                    </Button>
                  </Link>
                  <Link href="/trending">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm h-9 sm:h-10"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <TrendingUp className="w-4 h-4 mr-2 sm:mr-3" />
                      Trending
                    </Button>
                  </Link>
                  <Link href="/categories">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm h-9 sm:h-10"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Categories
                    </Button>
                  </Link>
                  
                  {user && (
                    <>
                      <div className="border-t border-border my-2"></div>
                      <Link href="/collections">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm h-9 sm:h-10"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <Heart className="w-4 h-4 mr-2 sm:mr-3" />
                          Collections
                        </Button>
                      </Link>
                      {user.isDeveloper && (
                        <Link href="/developer/upload">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-sm h-9 sm:h-10"
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <Upload className="w-4 h-4 mr-2 sm:mr-3" />
                            Upload Bot
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div
              className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-4 bg-card border rounded-lg sm:rounded-xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Command className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="font-semibold text-sm sm:text-base">Quick Actions</span>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="p-2 sm:p-3 rounded hover:bg-muted cursor-pointer">
                    <div className="font-medium text-sm">Search Bots</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Find automation bots</div>
                  </div>
                  <div className="p-2 sm:p-3 rounded hover:bg-muted cursor-pointer">
                    <div className="font-medium text-sm">Upload Bot</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Share your creation</div>
                  </div>
                  <div className="p-2 sm:p-3 rounded hover:bg-muted cursor-pointer">
                    <div className="font-medium text-sm">View Collections</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Manage saved bots</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
