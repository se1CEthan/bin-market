/**
 * Advanced Responsive Utilities
 * Comprehensive responsive design system for maximum device compatibility
 */

import { useState, useEffect } from 'react';

// Breakpoint definitions
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Device type detection
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'tv';
  orientation: 'portrait' | 'landscape';
  touchCapable: boolean;
  pixelRatio: number;
  screenSize: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  breakpoint: Breakpoint;
  isRetina: boolean;
  prefersReducedMotion: boolean;
  colorScheme: 'light' | 'dark' | 'no-preference';
}

// Hook for device information
export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        orientation: 'landscape',
        touchCapable: false,
        pixelRatio: 1,
        screenSize: { width: 1920, height: 1080 },
        viewport: { width: 1920, height: 1080 },
        breakpoint: 'xl',
        isRetina: false,
        prefersReducedMotion: false,
        colorScheme: 'light',
      };
    }

    return getDeviceInfo();
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo());
    };

    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // Listen for color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      mediaQuery.removeEventListener('change', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Get current device information
function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const pixelRatio = window.devicePixelRatio || 1;

  // Determine device type
  let type: DeviceInfo['type'] = 'desktop';
  if (width < 768) {
    type = 'mobile';
  } else if (width < 1024) {
    type = 'tablet';
  } else if (width > 1920) {
    type = 'tv';
  }

  // Determine breakpoint
  let breakpoint: Breakpoint = 'xs';
  for (const [bp, size] of Object.entries(breakpoints).reverse()) {
    if (width >= size) {
      breakpoint = bp as Breakpoint;
      break;
    }
  }

  // Check for touch capability
  const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check orientation
  const orientation = width > height ? 'landscape' : 'portrait';

  // Check for retina display
  const isRetina = pixelRatio >= 2;

  // Check motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check color scheme preference
  let colorScheme: DeviceInfo['colorScheme'] = 'no-preference';
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    colorScheme = 'dark';
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    colorScheme = 'light';
  }

  return {
    type,
    orientation,
    touchCapable,
    pixelRatio,
    screenSize: { width: screenWidth, height: screenHeight },
    viewport: { width, height },
    breakpoint,
    isRetina,
    prefersReducedMotion,
    colorScheme,
  };
}

// Hook for specific breakpoint matching
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return matches;
}

// Hook for responsive values
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const deviceInfo = useDeviceInfo();
  
  // Find the best matching value for current breakpoint
  const breakpointOrder: Breakpoint[] = ['4xl', '3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(deviceInfo.breakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}

// Responsive class generator
export function responsiveClasses(classes: Partial<Record<Breakpoint | 'base', string>>): string {
  const classArray: string[] = [];
  
  if (classes.base) {
    classArray.push(classes.base);
  }
  
  Object.entries(classes).forEach(([breakpoint, className]) => {
    if (breakpoint !== 'base' && className) {
      classArray.push(`${breakpoint}:${className}`);
    }
  });
  
  return classArray.join(' ');
}

// Container queries utilities
export const containerQueries = {
  xs: '@container (min-width: 20rem)',
  sm: '@container (min-width: 24rem)',
  md: '@container (min-width: 28rem)',
  lg: '@container (min-width: 32rem)',
  xl: '@container (min-width: 36rem)',
  '2xl': '@container (min-width: 42rem)',
  '3xl': '@container (min-width: 48rem)',
  '4xl': '@container (min-width: 56rem)',
  '5xl': '@container (min-width: 64rem)',
  '6xl': '@container (min-width: 72rem)',
  '7xl': '@container (min-width: 80rem)',
};

// Responsive grid utilities
export function getResponsiveGrid(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3,
  wide: number = 4
): string {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop} xl:grid-cols-${wide}`;
}

// Responsive spacing utilities
export function getResponsiveSpacing(
  mobile: string = '4',
  tablet: string = '6',
  desktop: string = '8'
): string {
  return `p-${mobile} md:p-${tablet} lg:p-${desktop}`;
}

// Responsive text utilities
export function getResponsiveText(
  mobile: string = 'sm',
  tablet: string = 'base',
  desktop: string = 'lg'
): string {
  return `text-${mobile} md:text-${tablet} lg:text-${desktop}`;
}

// Advanced responsive utilities
export const responsive = {
  // Fluid typography scale
  fluidText: (min: number, max: number, minVw: number = 320, maxVw: number = 1200) => {
    const slope = (max - min) / (maxVw - minVw);
    const yAxisIntersection = -minVw * slope + min;
    return `clamp(${min}rem, ${yAxisIntersection}rem + ${slope * 100}vw, ${max}rem)`;
  },

  // Fluid spacing scale
  fluidSpace: (min: number, max: number, minVw: number = 320, maxVw: number = 1200) => {
    const slope = (max - min) / (maxVw - minVw);
    const yAxisIntersection = -minVw * slope + min;
    return `clamp(${min}rem, ${yAxisIntersection}rem + ${slope * 100}vw, ${max}rem)`;
  },

  // Aspect ratio utilities
  aspectRatio: {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    ultrawide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]',
    golden: 'aspect-[1.618/1]',
  },

  // Safe area utilities for mobile devices
  safeArea: {
    top: 'pt-safe-top',
    bottom: 'pb-safe-bottom',
    left: 'pl-safe-left',
    right: 'pr-safe-right',
    all: 'p-safe',
  },
};

// Performance optimization for responsive images
export function getResponsiveImageSizes(
  mobile: string = '100vw',
  tablet: string = '50vw',
  desktop: string = '33vw'
): string {
  return `(max-width: 768px) ${mobile}, (max-width: 1024px) ${tablet}, ${desktop}`;
}

// Responsive animation utilities
export function getResponsiveAnimation(deviceInfo: DeviceInfo) {
  return {
    // Reduce animations on mobile for performance
    duration: deviceInfo.type === 'mobile' ? 0.2 : 0.3,
    // Disable complex animations if user prefers reduced motion
    enabled: !deviceInfo.prefersReducedMotion,
    // Use simpler animations on low-end devices
    complexity: deviceInfo.pixelRatio >= 2 ? 'high' : 'low',
  };
}

// Responsive layout utilities
export const layouts = {
  // Responsive container
  container: 'w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Responsive grid
  grid: {
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8',
    cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6',
    features: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8',
    testimonials: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  },
  
  // Responsive flex
  flex: {
    responsive: 'flex flex-col sm:flex-row items-center gap-4 sm:gap-6',
    center: 'flex flex-col items-center justify-center text-center',
    between: 'flex flex-col sm:flex-row items-center justify-between gap-4',
  },
  
  // Responsive sections
  section: {
    padding: 'py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32',
    container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  },
};

export default responsive;