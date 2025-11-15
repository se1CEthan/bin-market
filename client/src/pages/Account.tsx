import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Download, Star, Mail, Calendar, Shield } from 'lucide-react';

export default function Account() {
  const { user } = useAuth();

  const { data: purchases } = useQuery({
    queryKey: ['/api/account/purchases'],
  });

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="p-12 text-center">
            <h2 className="font-display text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your account.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="font-semibold text-xl mb-1" data-testid="text-user-name">{user.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4" data-testid="text-user-email">{user.email}</p>
                  
                  <div className="flex gap-2">
                    {user.isDeveloper && (
                      <Badge variant="secondary">Developer</Badge>
                    )}
                    {user.isAdmin && (
                      <Badge className="bg-primary">Admin</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {!user.isDeveloper && (
                    <Button className="w-full" asChild data-testid="button-become-developer">
                      <Link href="/developer/signup">
                        Become a Developer
                      </Link>
                    </Button>
                  )}
                  {user.isDeveloper && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/developer/dashboard">
                        Developer Dashboard
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchases */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  My Purchases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchases && purchases.length > 0 ? (
                  <div className="space-y-4">
                    {purchases.map((purchase: any) => (
                      <Card key={purchase.id} className="hover-elevate">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {purchase.bot?.thumbnailUrl && (
                              <img
                                src={purchase.bot.thumbnailUrl}
                                alt=""
                                className="w-16 h-16 rounded object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{purchase.bot?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="font-mono font-semibold text-primary">
                                ${purchase.amount}
                              </span>
                              <Button size="sm" asChild data-testid={`button-download-${purchase.id}`}>
                                <Link href={`/download/${purchase.botId}`}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No purchases yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start browsing bots to automate your workflow
                    </p>
                    <Button asChild>
                      <Link href="/bots">Browse Bots</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
