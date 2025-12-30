import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Bot {
  id: string;
  title: string;
  description: string;
  price: string;
  thumbnailUrl?: string;
  developer: {
    name: string;
  };
}

function CheckoutForm({ bot }: { bot: Bot }) {
  const [, setLocation] = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // This function is no longer used when PayPal Buttons are rendered.
      // Keep as fallback but inform user.
      setError('Use the PayPal button below to complete payment (cards supported).');
    } catch (error) {
      setError('Failed to initialize PayPal payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load PayPal SDK and render buttons (with card funding enabled)
  useEffect(() => {
    let mounted = true;

    async function setupPayPal() {
      try {
        const cfgResp = await fetch('/api/paypal/config');
        const cfg = await cfgResp.json();
        const clientId = cfg.clientId;
        if (!clientId) return;

        // Inject PayPal script
        const scriptId = 'paypal-sdk';
        if (document.getElementById(scriptId)) {
          // already loaded
        } else {
          const s = document.createElement('script');
          s.id = scriptId;
          s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons&enable-funding=card&intent=capture&currency=USD`;
          s.async = true;
          document.body.appendChild(s);
          await new Promise((resolve) => { s.onload = resolve; s.onerror = resolve; });
        }

        // Render buttons
        // @ts-ignore - global paypal
        if ((window as any).paypal && mounted) {
          // Clear container
          const container = document.getElementById('paypal-button-container');
          if (!container) return;
          container.innerHTML = '';

          (window as any).paypal.Buttons({
            style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
            createOrder: async () => {
              // Use existing server purchase endpoint which creates transaction and PayPal order
              const resp = await fetch(`/api/bots/${bot.id}/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
              });
              const data = await resp.json();
              if (!resp.ok) throw new Error(data.error || 'Failed to create order');
              return data.paypalOrderId || data.transaction?.paypalOrderId;
            },
            onApprove: async (data: any, actions: any) => {
              try {
                // Call server capture endpoint which also handles payout and post-purchase flow
                const captureResp = await fetch(`/api/bots/${bot.id}/capture/${data.orderID}`, {
                  method: 'POST',
                  credentials: 'include',
                });
                const captureData = await captureResp.json();
                if (!captureResp.ok) throw new Error(captureData.error || 'Capture failed');
                // success — refresh page or redirect to purchases
                window.location.href = '/account/purchases';
              } catch (err: any) {
                setError(err.message || 'Payment capture failed');
              }
            },
            onError: (err: any) => {
              console.error('PayPal Buttons error:', err);
              setError('Payment failed. Please try another method.');
            }
          }).render('#paypal-button-container');
        }
      } catch (err) {
        console.error('PayPal setup error:', err);
      }
    }

    setupPayPal();

    return () => { mounted = false; };
  }, [bot]);

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-800">Payment Successful!</h3>
        <p className="text-gray-600">
          Your purchase has been completed. You'll receive an email with download instructions.
        </p>
        <p className="text-sm text-gray-500">Redirecting to your purchases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* PayPal Payment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Secure Payment with PayPal</h3>
        
        <div id="paypal-button-container" className="flex justify-center" />
      </div>

      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Shield className="w-4 h-4" />
        <span>Your payment information is secure and encrypted with PayPal</span>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { botId } = useParams<{ botId: string }>();
  const [, setLocation] = useLocation();
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (botId) {
      fetchBot();
    }
  }, [botId]);

  const fetchBot = async () => {
    try {
      const response = await fetch(`/api/bots/${botId}`);
      const data = await response.json();
      
      if (response.ok) {
        setBot(data);
      } else {
        setError(data.error || 'Bot not found');
      }
    } catch (error) {
      setError('Failed to load bot details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => setLocation('/')} variant="outline">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  {bot.thumbnailUrl && (
                    <img
                      src={bot.thumbnailUrl}
                      alt={bot.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{bot.title}</h3>
                    <p className="text-sm text-gray-600">by {bot.developer.name}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {bot.description}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Bot Price</span>
                    <span>${bot.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Platform Fee (10%)</span>
                    <span>${(parseFloat(bot.price) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${bot.price}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <h4 className="font-medium text-blue-900 mb-1">What you'll get:</h4>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Instant download access</li>
                    <li>• License key for activation</li>
                    <li>• Email with setup instructions</li>
                    <li>• 30-day money-back guarantee</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CheckoutForm bot={bot} />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}