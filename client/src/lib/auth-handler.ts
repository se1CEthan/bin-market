// Handle OAuth callback with user type
export function initiateGoogleAuth(isDeveloper: boolean) {
  const params = new URLSearchParams();
  
  if (isDeveloper) {
    params.append('userType', 'developer');
    // ...existing code...
    }
  }
  
  const queryString = params.toString();
  const callbackUrl = `/api/auth/google${queryString ? `?${queryString}` : ''}`;
  
  window.location.href = callbackUrl;
}
