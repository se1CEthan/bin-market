import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { forwardRef, ReactNode, useRef, useState } from 'react';

interface AdvancedCardProps extends CardProps {
  children: ReactNode;
  hover3d?: boolean;
  glow?: boolean;
  tilt?: boolean;
  magnetic?: boolean;
  parallax?: boolean;
}

export const AdvancedCard = forwardRef<HTMLDivElement, AdvancedCardProps>(
  ({ 
    className, 
    children, 
    hover3d = false, 
    glow = false, 
    tilt = false, 
    magnetic = false,
    parallax = false,
    ...props 
  }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      
      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    const cardClasses = cn(
      "relative transition-all duration-300",
      {
        "hover:shadow-2xl hover:shadow-primary/10": glow,
        "transform-gpu": hover3d || tilt,
      },
      className
    );

    const motionProps = {
      style: hover3d ? {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d" as const,
      } : {},
      whileHover: magnetic ? { scale: 1.02, y: -5 } : tilt ? { rotateZ: 1 } : {},
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    };

    return (
      <motion.div
        ref={cardRef}
        className={cardClasses}
        onMouseMove={hover3d ? handleMouseMove : undefined}
        onMouseLeave={hover3d ? handleMouseLeave : undefined}
        {...motionProps}
      >
        <Card ref={ref} className="relative overflow-hidden" {...props}>
          {/* Glow Effect */}
          {glow && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Parallax Background */}
          {parallax && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"
              style={{
                x: useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]),
                y: useTransform(mouseYSpring, [-0.5, 0.5], [-10, 10]),
              }}
            />
          )}

          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>

          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full opacity-0"
            whileHover={{
              x: ['100%', '-100%'],
              opacity: [0, 1, 0],
              transition: { duration: 0.8 }
            }}
          />
        </Card>
      </motion.div>
    );
  }
);

AdvancedCard.displayName = 'AdvancedCard';

export function GlassCard({ children, className, ...props }: CardProps & { children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        className={cn(
          "backdrop-blur-md bg-card/50 border border-white/20 shadow-xl",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}

export function NeonCard({ children, className, color = 'primary', ...props }: CardProps & { 
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'green' | 'red' | 'blue';
}) {
  const colorClasses = {
    primary: 'shadow-primary/50 border-primary/50',
    secondary: 'shadow-secondary/50 border-secondary/50',
    green: 'shadow-green-500/50 border-green-500/50',
    red: 'shadow-red-500/50 border-red-500/50',
    blue: 'shadow-blue-500/50 border-blue-500/50',
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 0 30px var(--${color})`,
      }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        className={cn(
          "border-2 transition-all duration-300",
          colorClasses[color],
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}

export function FlipCard({ 
  front, 
  back, 
  className 
}: { 
  front: ReactNode; 
  back: ReactNode; 
  className?: string;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className={cn("relative w-full h-64 cursor-pointer", className)}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <Card className="absolute inset-0 w-full h-full backface-hidden">
          {front}
        </Card>
        
        {/* Back */}
        <Card 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {back}
        </Card>
      </motion.div>
    </motion.div>
  );
}

export function ExpandableCard({ 
  children, 
  expandedContent, 
  className 
}: { 
  children: ReactNode; 
  expandedContent: ReactNode; 
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={cn("cursor-pointer", className)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <Card className="overflow-hidden">
        <motion.div layout="position">
          {children}
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {expandedContent}
        </motion.div>
      </Card>
    </motion.div>
  );
}