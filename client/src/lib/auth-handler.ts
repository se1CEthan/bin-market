// Handle OAuth callback with user type and PayPal email
export function initiateGoogleAuth(isDeveloper: boolean, paypalEmail?: string) {
  const params = new URLSearchParams();
  
  if (isDeveloper) {
    params.append('userType', 'developer');
    if (paypalEmail) {
      params.append('paypalEmail', paypalEmail);
    }
  }
  
  const queryString = params.toString();
  const callbackUrl = `/api/auth/google${queryString ? `?${queryString}` : ''}`;
  
  window.location.href = callbackUrl;
}
