import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, ShoppingCart, Mail } from 'lucide-react';
import { initiateGoogleAuth } from '@/lib/auth-handler';

export default function Login() {
  const [userType, setUserType] = useState<'buyer' | 'developer'>('buyer');
  const [paypalEmail, setPaypalEmail] = useState('');

  const handleGoogleLogin = (isDeveloper: boolean) => {
    initiateGoogleAuth(isDeveloper, isDeveloper ? paypalEmail : undefined);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to BIN
          </h1>
          <p className="text-muted-foreground">
            Brain Inspired Network - Bot Marketplace
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Sign In or Sign Up</CardTitle>
            <CardDescription>
              Choose your account type to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(v) => setUserType(v as 'buyer' | 'developer')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="buyer" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Bot Buyer
                </TabsTrigger>
                <TabsTrigger value="developer" className="gap-2">
                  <Bot className="h-4 w-4" />
                  Developer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buyer" className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm">As a Bot Buyer:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Browse and purchase automation bots</li>
                    <li>Download bots instantly after purchase</li>
                    <li>Rate and review bots</li>
                    <li>Chat with developers</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => handleGoogleLogin(false)}
                  className="w-full gap-2"
                  size="lg"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You'll use PayPal to purchase bots securely
                </p>
              </TabsContent>

              <TabsContent value="developer" className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm">As a Developer:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Upload and sell your automation bots</li>
                    <li>Keep 90% of every sale</li>
                    <li>Get paid automatically to PayPal</li>
                    <li>Track sales and analytics</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="developerPaypal" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    PayPal Email (Optional - can add later)
                  </Label>
                  <Input
                    id="developerPaypal"
                    type="email"
                    placeholder="your-paypal@example.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add your PayPal email to receive automatic payouts (90% of sales)
                  </p>
                </div>

                <Button 
                  onClick={() => handleGoogleLogin(true)}
                  className="w-full gap-2"
                  size="lg"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google as Developer
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You can update your PayPal email anytime in settings
                </p>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Secure authentication powered by Google
          </p>
        </div>
      </div>
    </div>
  );
}
