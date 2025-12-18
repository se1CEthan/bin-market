/**
 * Advanced Loading System
 * Revolutionary loading states with beautiful animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, Zap, Bot, Sparkles, Code, Cpu, Database, Network } from 'lucide-react';

// Advanced Loading Spinner
export function AdvancedSpinner({ 
  size = 'md',
  variant = 'default',
  className 
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'pulse' | 'orbit' | 'dots' | 'bars' | 'neural';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn('relative', sizeClasses[size], className)}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-primary to-secondary rounded-full" />
      </motion.div>
    );
  }

  if (variant === 'orbit') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <motion.div
          className="absolute inset-0 border-2 border-primary/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2 -translate-y-1"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `0 ${parseInt(sizeClasses[size].split(' ')[1].replace('h-', '')) * 2}px` }}
        />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex items-end gap-1', className)}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-1 bg-primary rounded-full"
            animate={{
              height: ['8px', '24px', '8px'],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'neural') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            animate={{
              strokeDasharray: ["0 126", "63 63", "0 126"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary/50"
            animate={{
              strokeDasharray: ["0 220", "110 110", "0 220"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className="w-full h-full text-primary" />
    </motion.div>
  );
}

// Advanced Loading Screen
export function LoadingScreen({ 
  message = "Loading...",
  progress,
  showProgress = false,
  variant = 'default'
}: {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  variant?: 'default' | 'bot' | 'neural' | 'matrix';
}) {
  const [loadingMessages] = useState([
    "Initializing bot intelligence...",
    "Connecting to neural networks...",
    "Loading automation protocols...",
    "Synchronizing data streams...",
    "Optimizing performance...",
    "Almost ready...",
  ]);
  
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  if (variant === 'bot') {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="mb-8"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Bot className="w-24 h-24 text-primary mx-auto" />
          </motion.div>
          
          <motion.h2
            className="text-2xl font-bold mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Bot Intelligence Loading
          </motion.h2>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              className="text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {loadingMessages[currentMessage]}
            </motion.p>
          </AnimatePresence>
          
          <AdvancedSpinner variant="neural" size="lg" />
        </div>
      </div>
    );
  }

  if (variant === 'neural') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="relative z-10 w-32 h-32 mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Cpu className="w-full h-full text-primary" />
            </motion.div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Neural Network Initializing
          </h2>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            {[Database, Network, Code, Zap].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Icon className="w-6 h-6 text-primary" />
              </motion.div>
            ))}
          </div>
          
          {showProgress && progress !== undefined && (
            <div className="w-64 mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'matrix') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 text-green-500 font-mono text-sm opacity-70"
              style={{ left: `${i * 5}%` }}
              animate={{
                y: ['0vh', '100vh'],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2,
              }}
            >
              {Array.from({ length: 20 }).map((_, j) => (
                <div key={j} className="mb-2">
                  {Math.random() > 0.5 ? '1' : '0'}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
        
        <div className="relative z-10 text-center text-green-500">
          <motion.div
            className="text-6xl font-mono mb-4"
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            BIN
          </motion.div>
          <div className="text-xl font-mono">
            {message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <AdvancedSpinner size="xl" variant="orbit" className="mb-8" />
        <h2 className="text-xl font-semibold mb-2">{message}</h2>
        {showProgress && progress !== undefined && (
          <div className="w-48 mx-auto">
            <div className="w-full bg-muted rounded-full h-1">
              <motion.div
                className="bg-primary h-1 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton Loaders
export function AdvancedSkeleton({ 
  variant = 'default',
  className,
  animate = true 
}: {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'bot-card';
  className?: string;
  animate?: boolean;
}) {
  const baseClasses = "bg-muted rounded";
  const animationClasses = animate ? "animate-pulse" : "";

  if (variant === 'card') {
    return (
      <div className={cn("space-y-4 p-4 border rounded-lg", className)}>
        <div className={cn(baseClasses, animationClasses, "h-4 w-3/4")} />
        <div className={cn(baseClasses, animationClasses, "h-32")} />
        <div className="space-y-2">
          <div className={cn(baseClasses, animationClasses, "h-3 w-full")} />
          <div className={cn(baseClasses, animationClasses, "h-3 w-2/3")} />
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className={cn(baseClasses, animationClasses, "h-4 w-full")} />
        <div className={cn(baseClasses, animationClasses, "h-4 w-5/6")} />
        <div className={cn(baseClasses, animationClasses, "h-4 w-4/6")} />
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={cn(baseClasses, animationClasses, "w-10 h-10 rounded-full", className)} />
    );
  }

  if (variant === 'bot-card') {
    return (
      <motion.div 
        className={cn("border rounded-xl p-6 space-y-4", className)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-4">
          <div className={cn(baseClasses, animationClasses, "w-16 h-16 rounded-lg")} />
          <div className="flex-1 space-y-2">
            <div className={cn(baseClasses, animationClasses, "h-5 w-3/4")} />
            <div className={cn(baseClasses, animationClasses, "h-4 w-1/2")} />
          </div>
        </div>
        <div className="space-y-2">
          <div className={cn(baseClasses, animationClasses, "h-3 w-full")} />
          <div className={cn(baseClasses, animationClasses, "h-3 w-5/6")} />
        </div>
        <div className="flex justify-between items-center">
          <div className={cn(baseClasses, animationClasses, "h-6 w-16")} />
          <div className={cn(baseClasses, animationClasses, "h-8 w-20 rounded-md")} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn(baseClasses, animationClasses, "h-4 w-full", className)} />
  );
}

// Loading States Hook
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;

  const isAnyLoading = () => Object.values(loadingStates).some(Boolean);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
  };
}