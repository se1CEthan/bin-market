import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, TrendingUp, DollarSign, Shield } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function DeveloperSignup() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const becomeDeveloperMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/developer/signup', {});
    },
    onSuccess: async () => {
      toast({
        title: 'Welcome, Developer!',
        description: 'You can now upload and sell bots on the marketplace.',
      });
      // Wait for the user data to refresh before navigating
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      await queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
      setTimeout(() => {
        navigate('/developer/upload');
      }, 500);
    },
    onError: () => {
      toast({
        title: 'Signup Failed',
        description: 'Unable to register as developer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="p-12 text-center max-w-md mx-auto">
            <h2 className="font-display text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to become a developer.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (user.isDeveloper) {
    navigate('/developer/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Become a Developer
          </h1>
          <p className="text-lg text-muted-foreground">
            Join thousands of developers earning from their automation bots
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Keep 90%</h3>
            <p className="text-sm text-muted-foreground">
              Low commission. You keep 90% of every sale.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Instant Payouts</h3>
            <p className="text-sm text-muted-foreground">
              Request payouts anytime. Get paid directly to your PayPal.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Full Control</h3>
            <p className="text-sm text-muted-foreground">
              Set your own prices. Manage your bots. Control your business.
            </p>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Developer Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Zero Listing Fees</p>
                <p className="text-sm text-muted-foreground">
                  Upload unlimited bots at no cost. No monthly subscription required.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Built-in Payment Processing</p>
                <p className="text-sm text-muted-foreground">
                  Secure PayPal integration. We handle all transactions for you.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Analytics Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Track sales, earnings, and bot performance in real-time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Direct Customer Communication</p>
                <p className="text-sm text-muted-foreground">
                  Chat with buyers directly. Provide support and build relationships.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Featured Listing Options</p>
                <p className="text-sm text-muted-foreground">
                  Boost your bots to homepage for maximum visibility.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Button
                size="lg"
                className="w-full"
                onClick={() => becomeDeveloperMutation.mutate()}
                disabled={becomeDeveloperMutation.isPending}
                data-testid="button-signup-developer"
              >
                {becomeDeveloperMutation.isPending ? 'Processing...' : 'Become a Developer Now'}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                By signing up, you agree to our developer terms and conditions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
