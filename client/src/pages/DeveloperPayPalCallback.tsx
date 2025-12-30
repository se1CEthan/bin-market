import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function DeveloperPayPalCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Linking your PayPal account...');
  const [location, setLocation] = useLocation();

  useEffect(() => {
    async function handle() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (!code) {
          setStatus('error');
          setMessage('Missing authorization code from PayPal.');
          return;
        }

        const resp = await fetch('/api/developer/paypal/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          setStatus('error');
          setMessage(err.error || 'Failed to link PayPal account');
          return;
        }

        const data = await resp.json();
        setStatus('success');
        setMessage('PayPal account linked: ' + (data.paypalEmail || ''));

        // Redirect back to developer dashboard after short delay
        setTimeout(() => setLocation('/developer/dashboard'), 1800);
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.message || 'Unexpected error while linking PayPal');
      }
    }

    handle();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          {status === 'processing' && (
            <div>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <h3 className="text-lg font-semibold">Connected</h3>
              <p className="mt-2">{message}</p>
              <Button className="mt-4" onClick={() => setLocation('/developer/dashboard')}>Go to Dashboard</Button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <h3 className="text-lg font-semibold text-red-600">Error</h3>
              <p className="mt-2 text-red-600">{message}</p>
              <Button className="mt-4" onClick={() => setLocation('/developer/dashboard')}>Back</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
