import { Link } from 'wouter';
import logoUrl from '@assets/bin-high-resolution-logo-transparent_1763235895212.png';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="BIN Logo" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-sm text-muted-foreground">
              The leading marketplace for automation bots. Buy ready-made bots or sell yours and keep 90% profit.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/bots">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Browse Bots</span>
                </Link>
              </li>
              <li>
                <Link href="/categories">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Categories</span>
                </Link>
              </li>
              <li>
                <Link href="/developers">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Top Developers</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Developers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/developer/upload">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Sell Your Bot</span>
                </Link>
              </li>
              <li>
                <Link href="/developer/dashboard">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Dashboard</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Brain Inspired Network (BIN). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
