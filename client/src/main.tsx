import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/animations.css";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              fontFamily: 'system-ui, sans-serif',
              maxWidth: '800px',
              margin: '0 auto',
              background: 'hsl(var(--background) / 1)',
              color: 'hsl(var(--foreground) / 1)',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h1 style={{ color: 'hsl(var(--destructive) / 1)', marginBottom: '20px', fontSize: '2rem' }}>
            BIN Marketplace - Loading Error
          </h1>
              <p style={{ marginBottom: '20px', color: 'hsl(var(--muted-foreground) / 1)', fontSize: '1.1rem' }}>
            There was an error loading the application. Please try refreshing the page.
          </p>
          <div style={{ marginBottom: '30px' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '12px 24px',
                    background: 'hsl(var(--primary) / 1)',
                    color: 'hsl(var(--primary-foreground) / 1)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                marginRight: '10px'
              }}
            >
              Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/'} 
              style={{
                padding: '12px 24px',
                    background: 'hsl(var(--destructive) / 1)',
                    color: 'hsl(var(--destructive-foreground) / 1)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Go Home
            </button>
          </div>
          <details style={{ 
            whiteSpace: 'pre-wrap', 
            textAlign: 'left', 
            marginTop: '20px',
                padding: '20px',
                background: 'hsl(var(--card) / 1)',
            borderRadius: '8px',
                border: '1px solid hsl(var(--card-border) / 1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
              Technical Details (Click to expand)
            </summary>
            <strong>Error:</strong> {this.state.error?.toString()}<br/><br/>
            <strong>Stack:</strong><br/>{this.state.error?.stack}<br/><br/>
            <strong>Component Stack:</strong><br/>{this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple fallback component
function SimpleFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'hsl(var(--background) / 1)',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: 'hsl(var(--foreground) / 1)', 
          marginBottom: '1rem' 
        }}>
          BIN Marketplace
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'hsl(var(--muted-foreground) / 1)', 
          marginBottom: '2rem' 
        }}>
          Professional Automation Solutions
        </p>
        <div style={{
          padding: '20px',
          background: 'hsl(var(--card) / 1)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.06)',
          marginBottom: '2rem'
        }}>
          <p style={{ color: '#059669', fontWeight: '500', marginBottom: '10px' }}>
            ✅ Application is loading...
          </p>
          <p style={{ color: '#0891b2', fontSize: '0.9rem' }}>
            If this message persists, please refresh the page.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            background: 'hsl(var(--primary) / 1)',
            color: 'hsl(var(--primary-foreground) / 1)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// Dynamic import with fallback
async function loadApp() {
  try {
    const { default: App } = await import('./App');
    return App;
  } catch (error) {
    console.error('Failed to load main App component:', error);
    return SimpleFallback;
  }
}

// Initialize the application
const rootElement = document.getElementById("root");
// Force dark theme by default for the entire site
try {
  if (typeof document !== 'undefined' && !document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {
  // ignore in non-browser environments
}
if (!rootElement) {
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: system-ui;">
      <h1 style="color: #dc2626;">Error: Root element not found</h1>
      <p>The application could not find the root element to mount to.</p>
    </div>
  `;
} else {
  loadApp().then(App => {
    createRoot(rootElement).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  }).catch(error => {
    console.error('Failed to initialize app:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: system-ui; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="color: #dc2626; margin-bottom: 20px;">BIN Marketplace - Initialization Error</h1>
        <p style="margin-bottom: 20px; color: #6b7280;">Failed to load the application. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background-color: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
          Refresh Page
        </button>
        <details style="margin-top: 20px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
          <summary style="cursor: pointer; font-weight: bold;">Error Details</summary>
          <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow: auto;">${error.toString()}</pre>
        </details>
      </div>
    `;
  });
}
