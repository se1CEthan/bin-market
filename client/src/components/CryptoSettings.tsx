import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';

export function CryptoSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [cryptoEnabled, setCryptoEnabled] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/developer/crypto'],
    queryFn: async () => {
      const resp = await fetch('/api/developer/crypto', { credentials: 'include' });
      if (!resp.ok) throw new Error('Failed to fetch crypto settings');
      return resp.json();
    },
    onSuccess: (data: any) => {
      if (data.cryptoWallet) {
        setCryptoWallet(data.cryptoWallet);
        setCryptoEnabled(data.cryptoEnabled || false);
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { cryptoWallet: string; cryptoEnabled: boolean }) => {
      const resp = await fetch('/api/developer/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!resp.ok) throw new Error('Failed to save crypto settings');
      return resp.json();
    },
    onSuccess: () => {
      toast({ title: 'Crypto settings saved successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/developer/crypto'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to save crypto settings', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cryptoWallet.trim()) {
      toast({ 
        title: 'Crypto wallet address is required',
        variant: 'destructive' 
      });
      return;
    }
    saveMutation.mutate({ cryptoWallet: cryptoWallet.trim(), cryptoEnabled });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
        <h3 className="text-base sm:text-lg font-semibold">Crypto Payout Settings</h3>
      </div>

      <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cryptoWallet" className="text-sm sm:text-base">Crypto Wallet Address</Label>
          <Input
            id="cryptoWallet"
            type="text"
            placeholder="0x1234567890abcdef..."
            value={cryptoWallet}
            onChange={(e) => setCryptoWallet(e.target.value)}
            className="font-mono text-xs sm:text-sm"
            required
          />
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enter your crypto wallet address to receive automatic payouts
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 rounded-lg border p-3 sm:p-4">
          <div className="space-y-0.5">
            <Label htmlFor="cryptoEnabled" className="text-sm sm:text-base">
              Enable Automatic Payouts
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Automatically receive 90% of each sale to your crypto wallet
            </p>
          </div>
          <Switch
            id="cryptoEnabled"
            checked={cryptoEnabled}
            onCheckedChange={setCryptoEnabled}
            className="self-start sm:self-center"
          />
        </div>

        {settings?.cryptoWallet && settings?.cryptoEnabled && (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 sm:p-4 border border-green-200 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
                Automatic Payouts Enabled
              </p>
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-1 break-all">
                You'll receive 90% of each sale automatically to {settings.cryptoWallet.slice(0, 10)}...{settings.cryptoWallet.slice(-8)}
              </p>
            </div>
          </div>
        )}

        {!cryptoEnabled && cryptoWallet && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 sm:p-4 border border-amber-200 dark:border-amber-900">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-100">
                Manual Payouts Only
              </p>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 mt-1">
                Enable automatic payouts to receive payments instantly
              </p>
            </div>
          </div>
        )}

        {!cryptoWallet && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 sm:p-4 border border-blue-200 dark:border-blue-900">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">
                Set Up Crypto Wallet
              </p>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                Add your crypto wallet address to start receiving automatic payments
              </p>
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
          <h4 className="font-medium mb-2 text-sm sm:text-base">How it works:</h4>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>When someone buys your bot, payment goes through Cryptomus</li>
            <li>90% is automatically sent to your crypto wallet within minutes</li>
            <li>10% is kept by the platform as commission</li>
            <li>You can track all payouts in your dashboard</li>
            <li>Supports major cryptocurrencies (BTC, ETH, USDT, USDC, etc.)</li>
            <li>Powered by Cryptomus - secure and reliable crypto payments</li>
          </ul>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Crypto Settings'
          )}
        </Button>
      </form>
    </div>
  );
}