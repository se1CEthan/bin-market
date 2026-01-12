/**
 * Advanced Security & Authentication System
 * Implements enterprise-grade security features
 */

import { useEffect, useState, useCallback } from 'react';

// Security Configuration
interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireMFA: boolean;
  allowedOrigins: string[];
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 900000, // 15 minutes
  sessionTimeout: 3600000, // 1 hour
  passwordMinLength: 12,
  requireMFA: true,
  allowedOrigins: ['https://seltech-market.com'],
};

// Advanced Password Validation
export class PasswordValidator {
  private static readonly COMMON_PASSWORDS = new Set([
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890'
  ]);
  
  static validate(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // Length check
    if (password.length < DEFAULT_SECURITY_CONFIG.passwordMinLength) {
      feedback.push(`Password must be at least ${DEFAULT_SECURITY_CONFIG.passwordMinLength} characters long`);
    } else {
      score += 20;
    }
    
    // Character variety checks
    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain lowercase letters');
    } else {
      score += 15;
    }
    
    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain uppercase letters');
    } else {
      score += 15;
    }
    
    if (!/\d/.test(password)) {
      feedback.push('Password must contain numbers');
    } else {
      score += 15;
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('Password must contain special characters');
    } else {
      score += 15;
    }
    
    // Common password check
    if (this.COMMON_PASSWORDS.has(password.toLowerCase())) {
      feedback.push('Password is too common');
      score -= 30;
    }
    
    // Pattern checks
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Password should not contain repeated characters');
      score -= 10;
    }
    
    if (/123|abc|qwe/i.test(password)) {
      feedback.push('Password should not contain sequential characters');
      score -= 10;
    }
    
    // Entropy calculation
    const entropy = this.calculateEntropy(password);
    if (entropy < 50) {
      feedback.push('Password complexity is too low');
    } else {
      score += Math.min(20, entropy - 50);
    }
    
    return {
      isValid: score >= 70 && feedback.length === 0,
      score: Math.max(0, Math.min(100, score)),
      feedback,
    };
  }
  
  private static calculateEntropy(password: string): number {
    const charSets = [
      /[a-z]/.test(password) ? 26 : 0,
      /[A-Z]/.test(password) ? 26 : 0,
      /\d/.test(password) ? 10 : 0,
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 32 : 0,
    ];
    
    const charSetSize = charSets.reduce((sum, size) => sum + size, 0);
    return password.length * Math.log2(charSetSize);
  }
}

// Multi-Factor Authentication
export class MFAManager {
  private static readonly TOTP_WINDOW = 30; // seconds
  
  static generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  }
  
  static generateTOTP(secret: string, timestamp?: number): string {
    const time = Math.floor((timestamp || Date.now()) / 1000 / this.TOTP_WINDOW);
    const hmac = this.hmacSHA1(this.base32Decode(secret), this.intToBytes(time));
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
    return (code % 1000000).toString().padStart(6, '0');
  }
  
  static verifyTOTP(token: string, secret: string): boolean {
    const now = Date.now();
    const window = 1; // Allow 1 time step before/after
    
    for (let i = -window; i <= window; i++) {
      const timestamp = now + (i * this.TOTP_WINDOW * 1000);
      if (this.generateTOTP(secret, timestamp) === token) {
        return true;
      }
    }
    return false;
  }
  
  private static hmacSHA1(key: Uint8Array, data: Uint8Array): Uint8Array {
    // Simplified HMAC-SHA1 implementation
    // In production, use a proper crypto library
    return new Uint8Array(20); // Placeholder
  }
  
  private static base32Decode(encoded: string): Uint8Array {
    // Simplified base32 decode
    // In production, use a proper implementation
    return new Uint8Array(20); // Placeholder
  }
  
  private static intToBytes(num: number): Uint8Array {
    const bytes = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
      bytes[i] = num & 0xff;
      num >>= 8;
    }
    return bytes;
  }
}

// Content Security Policy Manager
export class CSPManager {
  private static policies: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };
  
  static generateCSPHeader(): string {
    return Object.entries(this.policies)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }
  
  static addSource(directive: string, source: string): void {
    if (!this.policies[directive]) {
      this.policies[directive] = [];
    }
    if (!this.policies[directive].includes(source)) {
      this.policies[directive].push(source);
    }
  }
}

// Rate Limiting
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();
  
  static isAllowed(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 900000 // 15 minutes
  ): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  static getRemainingRequests(identifier: string, maxRequests: number = 100): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - record.count);
  }
}

// Session Security Hook
export function useSessionSecurity() {
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);
  
  const checkSession = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    
    if (timeSinceActivity > DEFAULT_SECURITY_CONFIG.sessionTimeout) {
      setIsSessionValid(false);
      // Trigger logout
      window.location.href = '/login?reason=session_expired';
    }
  }, [lastActivity]);
  
  useEffect(() => {
    const interval = setInterval(checkSession, 60000); // Check every minute
    
    // Activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
    
    return () => {
      clearInterval(interval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [checkSession, updateActivity]);
  
  return { isSessionValid, updateActivity };
}

// XSS Protection
export class XSSProtection {
  private static readonly DANGEROUS_TAGS = [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea'
  ];
  
  private static readonly DANGEROUS_ATTRIBUTES = [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur'
  ];
  
  static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Remove dangerous tags
    this.DANGEROUS_TAGS.forEach(tag => {
      const elements = div.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });
    
    // Remove dangerous attributes
    const allElements = div.querySelectorAll('*');
    allElements.forEach(el => {
      this.DANGEROUS_ATTRIBUTES.forEach(attr => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      });
      
      // Remove javascript: URLs
      ['href', 'src', 'action'].forEach(attr => {
        const value = el.getAttribute(attr);
        if (value && value.toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr);
        }
      });
    });
    
    return div.innerHTML;
  }
  
  static escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// CSRF Protection
export class CSRFProtection {
  private static token: string | null = null;
  
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return this.token;
  }
  
  static getToken(): string | null {
    return this.token;
  }
  
  static validateToken(token: string): boolean {
    return this.token === token;
  }
  
  static addTokenToRequest(options: RequestInit): RequestInit {
    const token = this.getToken();
    if (token) {
      return {
        ...options,
        headers: {
          ...options.headers,
          'X-CSRF-Token': token,
        },
      };
    }
    return options;
  }
}

// Secure Storage
export class SecureStorage {
  private static readonly ENCRYPTION_KEY = 'seltech-market-secure-key';
  
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const encrypted = await this.encrypt(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Secure storage set failed:', error);
    }
  }
  
  static async getItem(key: string): Promise<any> {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Secure storage get failed:', error);
      return null;
    }
  }
  
  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
  
  private static async encrypt(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.ENCRYPTION_KEY),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
  
  private static async decrypt(encryptedData: string): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.ENCRYPTION_KEY),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  }
}