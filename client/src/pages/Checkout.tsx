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
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handleCryptoPayment = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const resp = await fetch('/api/crypto/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ botId: bot.id, amount: bot.price }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.payment_url) {
        setError(data.error || 'Failed to create crypto payment invoice');
        setIsProcessing(false);
        return;
      }
      setPaymentUrl(data.payment_url);
      // Optionally, redirect automatically:
      // window.location.href = data.payment_url;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize crypto payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold">Pay with Crypto (Cryptomus)</h3>
        <Button
          onClick={handleCryptoPayment}
          disabled={isProcessing || !!paymentUrl}
          className="w-full text-sm sm:text-base"
        >
          {isProcessing ? 'Processing...' : 'Pay with Crypto'}
        </Button>
        {paymentUrl && (
          <div className="mt-4">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm sm:text-base break-all"
            >
              Click here to complete your crypto payment
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>Your payment is processed securely via Cryptomus</span>
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
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Complete Your Purchase</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-3 sm:space-x-4">
                  {bot.thumbnailUrl && (
                    <img
                      src={bot.thumbnailUrl}
                      alt={bot.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">{bot.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">by {bot.developer.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                      {bot.description}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Bot Price</span>
                    <span>${bot.price}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span>Platform Fee (10%)</span>
                    <span>${(parseFloat(bot.price) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base sm:text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${bot.price}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-xs sm:text-sm">
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
                <CardTitle className="text-lg sm:text-xl">Payment Details</CardTitle>
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