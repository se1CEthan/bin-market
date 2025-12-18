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
import { Search, Upload, User, LogOut, Settings, ShoppingBag, LayoutDashboard, Heart, FolderOpen, GitCompare, Bell, Zap, TrendingUp, Sparkles, Command } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiveStats } from '@/lib/live-data';
import logoUrl from '@assets/bin-high-resolution-logo-transparent_1763235895212.png';

export function Header() {
  const [location, navigate] = useLocation();
  const { user, login, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { stats: liveStats } = useLiveStats();

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
        {/* Live Activity Bar */}
        <motion.div 
          className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 px-4 py-1"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.5 }}
        >
          <div className="container mx-auto flex items-center justify-center gap-6 text-xs">
            {liveStats && (
              <>
                <motion.div 
                  className="flex items-center gap-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>{liveStats.onlineUsers.toLocaleString()} users online</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  <span>{liveStats.newBotsThisWeek} new bots this week</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span>{liveStats.salesToday} sales today</span>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/">
              <motion.div 
                className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md p-2 -ml-2 cursor-pointer" 
                data-testid="link-home"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.img 
                  src={logoUrl} 
                  alt="BIN Logo" 
                  className="h-10 w-auto object-contain" 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

              </motion.div>
            </Link>

            {/* Quick Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/bots">
                    <Zap className="w-4 h-4 mr-1" />
                    Explore
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/trending">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Trending
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/categories">
                    Categories
                  </Link>
                </Button>
              </motion.div>
            </nav>

            {/* Enhanced Search */}
            <div className="hidden md:block w-full max-w-sm relative">
              <AdvancedSearch 
                onSearch={(query, filters) => {
                  const params = new URLSearchParams();
                  if (query) params.append('search', query);
                  filters.forEach(filter => {
                    params.append(filter.type, filter.value);
                  });
                  navigate(`/bots?${params.toString()}`);
                }}
                placeholder="Search bots..."
                className="w-full"
              />
              <motion.div
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Command className="w-3 h-3" />
                <span>K</span>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Quick Actions */}
                <motion.div 
                  className="hidden sm:flex items-center gap-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" asChild className="relative">
                      <Link href="/collections">
                        <Heart className="h-5 w-5" />
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                        >
                          3
                        </Badge>
                      </Link>
                    </Button>
                  </motion.div>
                  
                  <NotificationBell />
                </motion.div>

                {user.isDeveloper && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="default"
                      asChild
                      className="hidden sm:flex bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 hover:from-primary/20 hover:to-secondary/20"
                      data-testid="button-upload-bot"
                    >
                      <Link href="/developer/upload">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Bot
                        <motion.div
                          className="ml-2 w-2 h-2 bg-green-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </Link>
                    </Button>
                  </motion.div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost" size="icon" className="rounded-full relative" data-testid="button-user-menu">
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-0">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-primary/5 to-secondary/5 p-4 border-b"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {user.isDeveloper ? 'Developer' : 'User'}
                            </Badge>
                            {user.isAdmin && (
                              <Badge variant="default" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    <div className="p-2 space-y-1">
                      <DropdownMenuItem asChild data-testid="menu-item-account" className="cursor-pointer">
                        <Link href="/account" className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">My Account</span>
                            <span className="text-xs text-muted-foreground">Profile & settings</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild data-testid="menu-item-purchases" className="cursor-pointer">
                        <Link href="/account/purchases" className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                          <ShoppingBag className="h-4 w-4 text-green-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">My Purchases</span>
                            <span className="text-xs text-muted-foreground">Downloaded bots</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/collections" className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                          <Heart className="h-4 w-4 text-red-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Collections</span>
                            <span className="text-xs text-muted-foreground">Saved & wishlist</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/compare" className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                          <GitCompare className="h-4 w-4 text-blue-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Compare Bots</span>
                            <span className="text-xs text-muted-foreground">Side-by-side analysis</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      
                      {user.isDeveloper && (
                        <DropdownMenuItem asChild data-testid="menu-item-developer" className="cursor-pointer">
                          <Link href="/developer/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                            <LayoutDashboard className="h-4 w-4 text-purple-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">Developer Dashboard</span>
                              <span className="text-xs text-muted-foreground">Manage your bots</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      
                      {user.isAdmin && (
                        <DropdownMenuItem asChild data-testid="menu-item-admin" className="cursor-pointer">
                          <Link href="/admin/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10">
                            <Settings className="h-4 w-4 text-orange-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">Admin Dashboard</span>
                              <span className="text-xs text-muted-foreground">Platform management</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <div className="p-2">
                      <DropdownMenuItem 
                        onClick={logout} 
                        data-testid="menu-item-logout"
                        className="cursor-pointer flex items-center gap-3 p-2 rounded-md hover:bg-red-50 text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" asChild data-testid="button-login">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    asChild 
                    data-testid="button-get-started"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
                  >
                    <Link href="/login">
                      Get Started
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <AnimatePresence>
          <motion.div 
            className="md:hidden border-t border-border px-4 py-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card/50 backdrop-blur border-primary/20 focus:border-primary/50"
                data-testid="input-search-mobile"
              />
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ⌘K
              </motion.div>
            </form>
          </motion.div>
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
              className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border rounded-lg shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Command className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Quick Actions</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded hover:bg-muted cursor-pointer">
                    <div className="font-medium">Search Bots</div>
                    <div className="text-sm text-muted-foreground">Find automation bots</div>
                  </div>
                  <div className="p-2 rounded hover:bg-muted cursor-pointer">
                    <div className="font-medium">Upload Bot</div>
                    <div className="text-sm text-muted-foreground">Share your creation</div>
                  </div>
                  <div className="p-2 rounded hover:bg-muted cursor-pointer">
                    <div className="font-medium">View Collections</div>
                    <div className="text-sm text-muted-foreground">Manage saved bots</div>
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
