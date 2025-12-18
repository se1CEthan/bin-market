import { useEffect, useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function PaymentSuccess() {
  const [location] = useLocation();
  const [, params] = useRoute('/payment/success/:botId');
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const token = searchParams.get('token'); // PayPal order ID
  const botId = params?.botId;

  const captureMutation = useMutation({
    mutationFn: async () => {
      if (!botId || !token) throw new Error('Missing parameters');
      const response = await apiRequest('POST', `/api/bots/${botId}/capture/${token}`, {});
      return response.json();
    },
    onSuccess: () => {
      setStatus('success');
    },
    onError: () => {
      setStatus('error');
    },
  });

  useEffect(() => {
    if (botId && token && status === 'processing') {
      captureMutation.mutate();
    }
  }, [botId, token]);

  return (
    <div className="min-h-screen py-16 flex items-center justify-center">
      <div className="container mx-auto px-4 md:px-6 max-w-md">
        <Card className="p-12 text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-6" />
              <h2 className="font-display text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-6" />
              <h2 className="font-display text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your purchase is complete. You can now download your bot.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href={`/bot/${botId}`}>View Bot</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/account/purchases">My Purchases</Link>
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 mx-auto text-red-500 mb-6" />
              <h2 className="font-display text-2xl font-bold mb-2">Payment Failed</h2>
              <p className="text-muted-foreground mb-6">
                There was an error processing your payment. Please try again.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href={`/bot/${botId}`}>Try Again</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/bots">Browse Bots</Link>
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
