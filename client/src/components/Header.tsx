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
import { Search, Upload, User, LogOut, Settings, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import logoUrl from '@assets/bin-high-resolution-logo-transparent_1763235895212.png';

export function Header() {
  const [location, navigate] = useLocation();
  const { user, login, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/bots?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md p-2 -ml-2 cursor-pointer" data-testid="link-home">
              <img src={logoUrl} alt="BIN Logo" className="h-10 w-auto object-contain" />
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 w-full max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card"
                data-testid="input-search"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.isDeveloper && (
                <Button
                  variant="outline"
                  size="default"
                  asChild
                  className="hidden sm:flex"
                  data-testid="button-upload-bot"
                >
                  <Link href="/developer/upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Bot
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild data-testid="menu-item-account">
                    <Link href="/account">
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild data-testid="menu-item-purchases">
                    <Link href="/account/purchases">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      My Purchases
                    </Link>
                  </DropdownMenuItem>
                  {user.isDeveloper && (
                    <DropdownMenuItem asChild data-testid="menu-item-developer">
                      <Link href="/developer/dashboard">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Developer Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.isAdmin && (
                    <DropdownMenuItem asChild data-testid="menu-item-admin">
                      <Link href="/admin/dashboard">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="menu-item-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild data-testid="button-login">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild data-testid="button-get-started">
                <Link href="/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden border-t border-border px-4 py-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
            data-testid="input-search-mobile"
          />
        </form>
      </div>
    </header>
  );
}
