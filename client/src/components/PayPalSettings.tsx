import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function PayPalSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalEnabled, setPaypalEnabled] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/developer/paypal'],
    onSuccess: (data: any) => {
      if (data.paypalEmail) {
        // PayPalSettings removed. Use NOWPayments for all payment and payout settings.
              id="paypalEmail"
              type="email"
              placeholder="your-email@example.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter the email address associated with your PayPal account
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="paypalEnabled" className="text-base">
                Enable Automatic Payouts
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically receive 90% of each sale to your PayPal account
              </p>
            </div>
            <Switch
              id="paypalEnabled"
              checked={paypalEnabled}
              onCheckedChange={setPaypalEnabled}
            />
          </div>

          {settings?.paypalEmail && settings?.paypalEnabled && (
            <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-4 border border-green-200 dark:border-green-900">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Automatic Payouts Active
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  You'll receive 90% of each sale automatically to {settings.paypalEmail}
                </p>
              </div>
            </div>
          )}

          {!paypalEnabled && paypalEmail && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-900">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Automatic Payouts Disabled
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Enable automatic payouts to receive 90% of each sale instantly
                </p>
              </div>
            </div>
          )}

          {!paypalEmail && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-200 dark:border-blue-900">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Set Up PayPal
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Add your PayPal email to start receiving automatic payments
                </p>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">How it works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>When someone buys your bot, payment goes to the platform</li>
              <li>90% is automatically sent to your PayPal account within minutes</li>
              <li>10% is kept by the platform as commission</li>
              <li>You can track all payouts in your dashboard</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save PayPal Settings'
            )}
          </Button>

          <Button variant="secondary" className="w-full mt-2" onClick={handleConnect}>
            Connect with PayPal
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
