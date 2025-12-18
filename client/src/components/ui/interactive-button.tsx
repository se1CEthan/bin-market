import { motion, MotionProps } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface InteractiveButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  ripple?: boolean;
  magnetic?: boolean;
  glow?: boolean;
  children: ReactNode;
}

export const InteractiveButton = forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ 
    className, 
    loading, 
    success, 
    error, 
    ripple = true, 
    magnetic = false, 
    glow = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const motionProps: MotionProps = {
      whileHover: magnetic ? { scale: 1.05 } : { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    };

    const buttonClasses = cn(
      "relative overflow-hidden transition-all duration-300",
      {
        "bg-green-500 hover:bg-green-600": success,
        "bg-red-500 hover:bg-red-600": error,
        "shadow-lg shadow-primary/25": glow && !success && !error,
        "shadow-lg shadow-green-500/25": glow && success,
        "shadow-lg shadow-red-500/25": glow && error,
      },
      className
    );

    return (
      <motion.div {...motionProps}>
        <Button
          ref={ref}
          className={buttonClasses}
          disabled={disabled || loading}
          {...props}
        >
          {/* Ripple Effect */}
          {ripple && (
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-full scale-0"
              whileTap={{
                scale: 4,
                opacity: [0.5, 0],
              }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Content */}
          <div className="relative flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {success && !loading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                ✓
              </motion.div>
            )}
            {error && !loading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                ✗
              </motion.div>
            )}
            <motion.span
              animate={loading ? { opacity: 0.7 } : { opacity: 1 }}
            >
              {children}
            </motion.span>
          </div>

          {/* Glow Effect */}
          {glow && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          )}
        </Button>
      </motion.div>
    );
  }
);

InteractiveButton.displayName = 'InteractiveButton';

export function FloatingActionButton({ 
  children, 
  className, 
  ...props 
}: ButtonProps & { children: ReactNode }) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Button
        className={cn(
          "rounded-full w-14 h-14 shadow-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-primary/25",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

export function PulseButton({ children, className, ...props }: ButtonProps & { children: ReactNode }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Button
        className={cn(
          "relative bg-gradient-to-r from-primary to-secondary shadow-lg",
          className
        )}
        {...props}
      >
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-md"
          animate={{
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <span className="relative">{children}</span>
      </Button>
    </motion.div>
  );
}

export function GradientButton({ children, className, ...props }: ButtonProps & { children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        className={cn(
          "relative bg-gradient-to-r from-primary via-secondary to-primary bg-size-200 hover:bg-pos-100 transition-all duration-500",
          className
        )}
        style={{ backgroundSize: '200% 200%' }}
        {...props}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          whileHover={{
            x: ['100%', '-100%'],
            transition: { duration: 0.6 }
          }}
        />
        <span className="relative">{children}</span>
      </Button>
    </motion.div>
  );
}