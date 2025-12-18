/**
 * Advanced UI Components & Interactions
 * Revolutionary interactive components with cutting-edge UX
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

// Advanced Drag & Drop Interface
interface DragDropItem {
  id: string;
  type: string;
  data: any;
  preview?: React.ReactNode;
}

interface DragDropZone {
  id: string;
  accepts: string[];
  onDrop: (item: DragDropItem) => void;
  className?: string;
  children: React.ReactNode;
}

// Advanced Drag & Drop System
export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);
  const [dropZones, setDropZones] = useState<Map<string, DragDropZone>>(new Map());
  
  const registerDropZone = useCallback((zone: DragDropZone) => {
    setDropZones(prev => new Map(prev.set(zone.id, zone)));
  }, []);
  
  const unregisterDropZone = useCallback((zoneId: string) => {
    setDropZones(prev => {
      const newMap = new Map(prev);
      newMap.delete(zoneId);
      return newMap;
    });
  }, []);
  
  return (
    <DragDropContext.Provider value={{
      draggedItem,
      setDraggedItem,
      dropZones,
      registerDropZone,
      unregisterDropZone,
    }}>
      {children}
      {draggedItem && (
        <DragPreview item={draggedItem} />
      )}
    </DragDropContext.Provider>
  );
}

const DragDropContext = React.createContext<any>(null);

function DragPreview({ item }: { item: DragDropItem }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <motion.div
      className="fixed pointer-events-none z-50 opacity-80"
      style={{
        left: position.x + 10,
        top: position.y + 10,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.8 }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      {item.preview || (
        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg">
          {item.type}
        </div>
      )}
    </motion.div>
  );
}

// Advanced Draggable Component
export function Draggable({ 
  item, 
  children, 
  className,
  onDragStart,
  onDragEnd 
}: {
  item: DragDropItem;
  children: React.ReactNode;
  className?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const context = React.useContext(DragDropContext);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragStart = () => {
    setIsDragging(true);
    context.setDraggedItem(item);
    onDragStart?.();
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    context.setDraggedItem(null);
    onDragEnd?.();
  };
  
  return (
    <motion.div
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
        className
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, rotate: 2 }}
      layout
    >
      {children}
    </motion.div>
  );
}

// Advanced Drop Zone
export function DropZone({ zone, children }: { zone: DragDropZone; children: React.ReactNode }) {
  const context = React.useContext(DragDropContext);
  const [isOver, setIsOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);
  
  useEffect(() => {
    context.registerDropZone(zone);
    return () => context.unregisterDropZone(zone.id);
  }, [context, zone]);
  
  useEffect(() => {
    if (context.draggedItem) {
      setCanDrop(zone.accepts.includes(context.draggedItem.type));
    } else {
      setCanDrop(false);
    }
  }, [context.draggedItem, zone.accepts]);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canDrop) {
      setIsOver(true);
    }
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    if (canDrop && context.draggedItem) {
      zone.onDrop(context.draggedItem);
    }
  };
  
  return (
    <motion.div
      className={cn(
        zone.className,
        isOver && canDrop && "ring-2 ring-primary bg-primary/10",
        canDrop && "border-dashed border-2 border-primary/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      animate={{
        scale: isOver && canDrop ? 1.02 : 1,
        borderColor: isOver && canDrop ? "rgb(var(--primary))" : "transparent",
      }}
    >
      {children}
    </motion.div>
  );
}

// Advanced Gesture Recognition
export function GestureRecognizer({ 
  onSwipe,
  onPinch,
  onRotate,
  children,
  className 
}: {
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [touches, setTouches] = useState<Touch[]>([]);
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialAngle, setInitialAngle] = useState(0);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  
  const calculateDistance = (touch1: Touch, touch2: Touch) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };
  
  const calculateAngle = (touch1: Touch, touch2: Touch) => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchList = Array.from(e.touches);
    setTouches(touchList);
    
    if (touchList.length === 1) {
      startPos.current = {
        x: touchList[0].clientX,
        y: touchList[0].clientY,
      };
    } else if (touchList.length === 2) {
      setInitialDistance(calculateDistance(touchList[0], touchList[1]));
      setInitialAngle(calculateAngle(touchList[0], touchList[1]));
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const touchList = Array.from(e.touches);
    
    if (touchList.length === 2 && touches.length === 2) {
      const currentDistance = calculateDistance(touchList[0], touchList[1]);
      const currentAngle = calculateAngle(touchList[0], touchList[1]);
      
      if (onPinch && initialDistance > 0) {
        const scale = currentDistance / initialDistance;
        onPinch(scale);
      }
      
      if (onRotate) {
        const angleDiff = currentAngle - initialAngle;
        onRotate(angleDiff);
      }
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touches.length === 1 && startPos.current && onSwipe) {
      const touch = touches[0];
      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 50) { // Minimum swipe distance
        const velocity = distance / 100; // Simplified velocity calculation
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          onSwipe(deltaX > 0 ? 'right' : 'left', velocity);
        } else {
          onSwipe(deltaY > 0 ? 'down' : 'up', velocity);
        }
      }
    }
    
    setTouches([]);
    startPos.current = null;
    setInitialDistance(0);
    setInitialAngle(0);
  };
  
  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Advanced Parallax Component
export function ParallaxContainer({ 
  children, 
  speed = 0.5,
  className 
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.div
      className={className}
      style={{
        transform: `translateY(${scrollY * speed}px)`,
      }}
    >
      {children}
    </motion.div>
  );
}

// Advanced Morphing Shape
export function MorphingShape({ 
  shapes,
  duration = 2000,
  className 
}: {
  shapes: string[];
  duration?: number;
  className?: string;
}) {
  const [currentShape, setCurrentShape] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShape(prev => (prev + 1) % shapes.length);
    }, duration);
    
    return () => clearInterval(interval);
  }, [shapes.length, duration]);
  
  return (
    <motion.div
      className={className}
      animate={{
        clipPath: shapes[currentShape],
      }}
      transition={{
        duration: duration / 1000,
        ease: "easeInOut",
      }}
    />
  );
}

// Advanced Particle System
export function ParticleSystem({ 
  count = 50,
  className,
  particleClassName = "w-1 h-1 bg-primary/20 rounded-full absolute"
}: {
  count?: number;
  className?: string;
  particleClassName?: string;
}) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className={particleClassName}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Advanced Magnetic Effect
export function MagneticElement({ 
  children,
  strength = 0.3,
  className 
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  }, [strength, x, y]);
  
  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);
  
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// Advanced Liquid Button
export function LiquidButton({ 
  children,
  onClick,
  className,
  variant = "default"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "primary" | "secondary";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const liquidVariants = {
    default: {
      background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
      scale: 1,
    },
    hover: {
      background: "linear-gradient(45deg, #764ba2 0%, #667eea 100%)",
      scale: 1.05,
    },
    pressed: {
      scale: 0.95,
    },
  };
  
  return (
    <motion.button
      className={cn(
        "relative overflow-hidden rounded-full px-8 py-4 text-white font-semibold",
        "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r",
        "before:from-transparent before:via-white/20 before:to-transparent",
        "before:translate-x-[-100%] hover:before:translate-x-[100%]",
        "before:transition-transform before:duration-700",
        className
      )}
      variants={liquidVariants}
      initial="default"
      animate={isPressed ? "pressed" : isHovered ? "hover" : "default"}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTapEnd={() => setIsPressed(false)}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.span
        className="relative z-10"
        animate={{
          y: isPressed ? 1 : 0,
        }}
      >
        {children}
      </motion.span>
      
      {/* Liquid effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: isHovered 
            ? "radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)"
            : "transparent",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}

// Advanced Morphing Card
export function MorphingCard({ 
  children,
  morphOnHover = true,
  className 
}: {
  children: React.ReactNode;
  morphOnHover?: boolean;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50",
        "border border-gray-200 shadow-lg",
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        borderRadius: morphOnHover && isHovered ? "2rem" : "1rem",
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Morphing background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Morphing border effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-primary/50"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 1.1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// Advanced Ripple Effect
export function RippleEffect({ 
  children,
  className,
  rippleColor = "rgba(255, 255, 255, 0.6)"
}: {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
}) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const createRipple = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };
  
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onClick={createRipple}
    >
      {children}
      
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: rippleColor,
            }}
            initial={{
              width: 0,
              height: 0,
              opacity: 1,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              width: 300,
              height: 300,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}