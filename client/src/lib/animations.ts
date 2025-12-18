import { Variants } from 'framer-motion';

// Page transition animations
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Card animations
export const cardHover: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  tap: { scale: 0.98 },
};

export const cardSlideIn: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Button animations
export const buttonPress: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
  hover: { scale: 1.05 },
};

export const pulseAnimation: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Loading animations
export const spinAnimation: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// Complex animations
export const morphingCard: Variants = {
  initial: { 
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  hover: { 
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

export const glowEffect: Variants = {
  initial: { 
    boxShadow: '0 0 0 rgba(59, 130, 246, 0)',
  },
  hover: { 
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
    transition: { duration: 0.3 }
  },
};

// Text animations
export const typewriterEffect = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const letterAnimation: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Progress animations
export const progressFill: Variants = {
  initial: { width: '0%' },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 1, ease: 'easeOut' }
  }),
};

// Notification animations
export const notificationSlide: Variants = {
  initial: { opacity: 0, x: 300, scale: 0.3 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: { 
    opacity: 0, 
    x: 300, 
    scale: 0.5,
    transition: { duration: 0.2 }
  },
};

// Modal animations
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50,
    transition: { duration: 0.2 }
  },
};

// Floating animations
export const floatingAnimation: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Particle effect simulation
export const particleFloat: Variants = {
  animate: {
    y: [-20, -40, -20],
    x: [-10, 10, -10],
    opacity: [0.3, 0.8, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Magnetic effect for buttons
export const magneticHover = (strength: number = 10) => ({
  hover: {
    scale: 1.05,
    transition: { type: 'spring', stiffness: 300 }
  },
  tap: { scale: 0.95 }
});

// Ripple effect
export const rippleEffect: Variants = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { 
    scale: 4, 
    opacity: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

// Loading skeleton
export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// 3D card effect
export const card3D: Variants = {
  initial: { rotateX: 0, rotateY: 0 },
  hover: { 
    rotateX: 5, 
    rotateY: 5,
    transition: { type: 'spring', stiffness: 300 }
  },
};

// Elastic bounce
export const elasticBounce: Variants = {
  animate: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

// Smooth reveal
export const smoothReveal: Variants = {
  initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  animate: { 
    opacity: 1, 
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 0.8, ease: 'easeOut' }
  },
};

// Gradient shift
export const gradientShift: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Advanced micro-interactions
export const microBounce: Variants = {
  hover: {
    y: -2,
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  },
  tap: { y: 0 }
};

export const gentleGlow: Variants = {
  hover: {
    boxShadow: '0 0 20px rgba(var(--primary), 0.3)',
    transition: { duration: 0.3 }
  }
};

export const subtleScale: Variants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

// Loading states
export const breathingPulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const wavePulse: Variants = {
  animate: {
    scale: [1, 1.2, 1.4, 1.2, 1],
    opacity: [1, 0.8, 0.6, 0.4, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
};

// Text effects
export const textShimmer: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const countUp = (target: number, duration: number = 2) => ({
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
  // Custom animation for counting numbers
});

// Interactive elements
export const magneticPull = (strength: number = 20) => ({
  hover: {
    scale: 1.05,
    transition: { type: 'spring', stiffness: 300 }
  }
});

export const liquidButton: Variants = {
  hover: {
    borderRadius: ['8px', '16px', '24px', '16px', '8px'],
    transition: { duration: 0.6, ease: 'easeInOut' }
  }
};

// Page transitions
export const slideUpFade: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -60,
    transition: { duration: 0.4, ease: 'easeIn' }
  }
};

export const scaleRotate: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: { type: 'spring', stiffness: 200, damping: 15 }
  },
  exit: { 
    scale: 0, 
    rotate: 180,
    transition: { duration: 0.3 }
  }
};

// Complex animations
export const morphingShape: Variants = {
  animate: {
    borderRadius: ['20%', '50%', '30%', '40%', '20%'],
    rotate: [0, 90, 180, 270, 360],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const liquidBlob: Variants = {
  animate: {
    borderRadius: ['30% 70% 70% 30% / 30% 30% 70% 70%', 
                   '70% 30% 30% 70% / 70% 70% 30% 30%',
                   '30% 70% 70% 30% / 30% 30% 70% 70%'],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Particle system simulation
export const particleSystem = (count: number = 5) => ({
  animate: {
    y: Array(count).fill(0).map(() => Math.random() * -100 - 50),
    x: Array(count).fill(0).map(() => Math.random() * 200 - 100),
    opacity: Array(count).fill(0).map(() => Math.random() * 0.8 + 0.2),
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
});

// Advanced hover states
export const elevateOnHover: Variants = {
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: { type: 'spring', stiffness: 300 }
  }
};

export const glowOnHover: Variants = {
  hover: {
    boxShadow: [
      '0 0 0 rgba(var(--primary), 0)',
      '0 0 20px rgba(var(--primary), 0.3)',
      '0 0 40px rgba(var(--primary), 0.2)',
    ],
    transition: { duration: 0.4 }
  }
};

// Loading animations
export const dotsLoading: Variants = {
  animate: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const barsLoading: Variants = {
  animate: {
    scaleY: [1, 2, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Success/Error states
export const successPulse: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    backgroundColor: ['#10b981', '#34d399', '#10b981'],
    transition: {
      duration: 1,
      repeat: 2,
    },
  },
};

export const errorShake: Variants = {
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

// Responsive animation utility
export function getResponsiveAnimation(deviceInfo: any) {
  return {
    // Reduce animations on mobile for performance
    duration: deviceInfo.type === 'mobile' ? 0.2 : 0.3,
    // Disable complex animations if user prefers reduced motion
    enabled: !deviceInfo.prefersReducedMotion,
    // Use simpler animations on low-end devices
    complexity: deviceInfo.pixelRatio >= 2 ? 'high' : 'low',
  };
}