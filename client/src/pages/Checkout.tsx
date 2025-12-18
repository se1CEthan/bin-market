import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CreditCard, Shield, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

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
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: bot.id,
          amount: parseFloat(bot.price),
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setClientSecret(data.clientSecret);
      } else {
        setError(data.error || 'Failed to initialize payment');
      }
    } catch (error) {
      setError('Failed to initialize payment');
    }
  };

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        // Confirm payment on backend
        const response = await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (response.ok) {
          setSuccess(true);
          setTimeout(() => {
            setLocation('/account/purchases');
          }, 2000);
        } else {
          setError('Payment succeeded but failed to process order');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: bot.id,
          amount: parseFloat(bot.price),
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to PayPal
        const approvalUrl = data.links?.find((link: any) => link.rel === 'approve')?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        } else {
          setError('Failed to get PayPal approval URL');
        }
      } else {
        setError(data.error || 'Failed to create PayPal order');
      }
    } catch (error) {
      setError('Failed to initialize PayPal payment');
    } finally {
      setIsProcessing(false);
    }
  };

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

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Choose Payment Method</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`p-4 border-2 rounded-lg transition-colors ${
              paymentMethod === 'stripe'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Credit Card</span>
          </button>
          <button
            onClick={() => setPaymentMethod('paypal')}
            className={`p-4 border-2 rounded-lg transition-colors ${
              paymentMethod === 'paypal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <svg className="w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 6.413-7.97 6.413h-1.97c-.226 0-.417.164-.452.386l-.85 5.39-.24 1.533c-.032.205.114.386.32.386h2.29c.458 0 .848-.334.922-.788l.038-.24.73-4.63.047-.26c.074-.453.463-.788.922-.788h.58c3.76 0 6.705-1.528 7.56-5.95.357-1.85.174-3.4-.755-4.53-.233-.283-.5-.52-.795-.715z"/>
            </svg>
            <span className="text-sm font-medium">PayPal</span>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      {paymentMethod === 'stripe' ? (
        <form onSubmit={handleStripeSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Card Details</label>
            <div className="p-3 border border-gray-300 rounded-md">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              `Pay $${bot.price}`
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You'll be redirected to PayPal to complete your payment securely.
          </p>
          <Button
            onClick={handlePayPalPayment}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Redirecting...</span>
              </div>
            ) : (
              `Pay with PayPal - $${bot.price}`
            )}
          </Button>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Shield className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
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
                <Elements stripe={stripePromise}>
                  <CheckoutForm bot={bot} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}