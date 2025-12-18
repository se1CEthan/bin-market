import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { skeletonPulse } from '@/lib/animations';

interface AdvancedSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
  lines?: number;
  animated?: boolean;
}

export function AdvancedSkeleton({ 
  className, 
  variant = 'default', 
  lines = 1, 
  animated = true 
}: AdvancedSkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md";
  
  if (variant === 'card') {
    return (
      <motion.div
        className={cn("space-y-4 p-6 border rounded-lg", className)}
        variants={animated ? skeletonPulse : undefined}
        animate={animated ? "animate" : undefined}
      >
        <div className={cn(baseClasses, "h-48 w-full")} />
        <div className="space-y-2">
          <div className={cn(baseClasses, "h-6 w-3/4")} />
          <div className={cn(baseClasses, "h-4 w-full")} />
          <div className={cn(baseClasses, "h-4 w-2/3")} />
        </div>
        <div className="flex items-center space-x-2">
          <div className={cn(baseClasses, "h-8 w-8 rounded-full")} />
          <div className={cn(baseClasses, "h-4 w-24")} />
        </div>
      </motion.div>
    );
  }

  if (variant === 'text') {
    return (
      <motion.div
        className={cn("space-y-2", className)}
        variants={animated ? skeletonPulse : undefined}
        animate={animated ? "animate" : undefined}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              "h-4",
              i === lines - 1 ? "w-2/3" : "w-full"
            )}
          />
        ))}
      </motion.div>
    );
  }

  if (variant === 'avatar') {
    return (
      <motion.div
        className={cn(baseClasses, "h-12 w-12 rounded-full", className)}
        variants={animated ? skeletonPulse : undefined}
        animate={animated ? "animate" : undefined}
      />
    );
  }

  if (variant === 'button') {
    return (
      <motion.div
        className={cn(baseClasses, "h-10 w-24", className)}
        variants={animated ? skeletonPulse : undefined}
        animate={animated ? "animate" : undefined}
      />
    );
  }

  return (
    <motion.div
      className={cn(baseClasses, "h-4 w-full", className)}
      variants={animated ? skeletonPulse : undefined}
      animate={animated ? "animate" : undefined}
    />
  );
}

export function BotCardSkeleton() {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AdvancedSkeleton variant="card" />
    </motion.div>
  );
}

export function BotGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <BotCardSkeleton />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function StatsSkeleton() {
  return (
    <motion.div
      className="grid grid-cols-3 gap-6 md:gap-12 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 }}
        >
          <AdvancedSkeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <AdvancedSkeleton className="h-8 w-16 mx-auto mb-2" />
          <AdvancedSkeleton className="h-4 w-20 mx-auto" />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <motion.div
      className={cn(
        "border-2 border-primary/30 border-t-primary rounded-full",
        sizeClasses[size]
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}

export function PulsingDot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="w-2 h-2 bg-primary rounded-full"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay,
      }}
    />
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-3">
      <PulsingDot delay={0} />
      <PulsingDot delay={0.2} />
      <PulsingDot delay={0.4} />
    </div>
  );
}

export function ProgressBar({ 
  progress, 
  className,
  animated = true 
}: { 
  progress: number; 
  className?: string;
  animated?: boolean;
}) {
  return (
    <div className={cn("w-full bg-muted rounded-full h-2", className)}>
      <motion.div
        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: animated ? 1 : 0, ease: "easeOut" }}
      />
    </div>
  );
}

export function ShimmerEffect({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full",
        className
      )}
      animate={{ x: ['100%', '-100%'] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
    />
  );
}