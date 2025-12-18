import { motion, AnimatePresence } from 'framer-motion';
import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { forwardRef, useState, ReactNode } from 'react';
import { Eye, EyeOff, Search, Check, X, AlertCircle } from 'lucide-react';

interface EnhancedInputProps extends InputProps {
  label?: string;
  error?: string;
  success?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  floating?: boolean;
  animated?: boolean;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    label, 
    error, 
    success, 
    loading, 
    icon, 
    rightIcon, 
    floating = false,
    animated = true,
    type,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState(props.value || '');

    const hasValue = value && value.toString().length > 0;
    const isPassword = type === 'password';

    const inputClasses = cn(
      "transition-all duration-300",
      {
        "border-red-500 focus:border-red-500 focus:ring-red-500/20": error,
        "border-green-500 focus:border-green-500 focus:ring-green-500/20": success,
        "pl-10": icon,
        "pr-10": rightIcon || isPassword || success || error,
      },
      className
    );

    const labelClasses = cn(
      "transition-all duration-300",
      {
        "text-red-500": error,
        "text-green-500": success,
        "text-primary": isFocused && !error && !success,
      }
    );

    return (
      <motion.div 
        className="relative space-y-2"
        initial={animated ? { opacity: 0, y: 20 } : {}}
        animate={animated ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.3 }}
      >
        {label && !floating && (
          <Label className={labelClasses}>
            {label}
          </Label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {icon && (
            <motion.div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              animate={{ 
                color: isFocused ? 'rgb(var(--primary))' : 'rgb(var(--muted-foreground))',
                scale: isFocused ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          {/* Floating Label */}
          {floating && label && (
            <motion.label
              className={cn(
                "absolute left-3 pointer-events-none transition-all duration-300",
                labelClasses,
                {
                  "top-1/2 transform -translate-y-1/2 text-muted-foreground": !isFocused && !hasValue,
                  "top-2 text-xs": isFocused || hasValue,
                  "left-10": icon && (!isFocused && !hasValue),
                  "left-3": icon && (isFocused || hasValue),
                }
              )}
              animate={{
                y: isFocused || hasValue ? -8 : 0,
                scale: isFocused || hasValue ? 0.85 : 1,
              }}
            >
              {label}
            </motion.label>
          )}

          {/* Input */}
          <Input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={inputClasses}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setValue(e.target.value);
              props.onChange?.(e);
            }}
            {...props}
          />

          {/* Right Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
              />
            )}
            
            {success && !loading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Check className="w-4 h-4 text-green-500" />
              </motion.div>
            )}
            
            {error && !loading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <AlertCircle className="w-4 h-4 text-red-500" />
              </motion.div>
            )}

            {isPassword && (
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.button>
            )}

            {rightIcon && !loading && !success && !error && !isPassword && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
          </div>

          {/* Focus Ring Animation */}
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-primary/50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: isFocused ? 1 : 0,
              scale: isFocused ? 1 : 0.95,
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-sm text-red-500 flex items-center gap-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

export function SearchInput({ 
  onSearch, 
  placeholder = "Search...", 
  className,
  ...props 
}: {
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
} & Omit<InputProps, 'onChange'>) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  return (
    <motion.div
      className="relative"
      whileFocusWithin={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <EnhancedInput
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        icon={<Search className="w-4 h-4" />}
        className={className}
        animated
        {...props}
      />
      
      {/* Search Suggestions Backdrop */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-md -z-10"
        initial={{ opacity: 0 }}
        whileFocusWithin={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export function AnimatedTextarea({ 
  label, 
  error, 
  success, 
  className, 
  ...props 
}: {
  label?: string;
  error?: string;
  success?: boolean;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <Label className={cn({
          "text-red-500": error,
          "text-green-500": success,
          "text-primary": isFocused && !error && !success,
        })}>
          {label}
        </Label>
      )}
      
      <motion.div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
            {
              "border-red-500 focus-visible:ring-red-500/20": error,
              "border-green-500 focus-visible:ring-green-500/20": success,
            },
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* Focus Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-md border-2 border-primary/50 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1 : 0.95,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="text-sm text-red-500 flex items-center gap-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}