import React, { forwardRef } from 'react';
import { TextInput, Text, View, TextInputProps, TextStyle } from 'react-native';
import { theme } from '../theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  style?: TextStyle;
}

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  style,
  ...props
}, ref) => {
  const getVariantClasses = () => {
    const baseClasses = 'border rounded-lg';
    
    switch (variant) {
      case 'default':
        return `${baseClasses} bg-neutral-50 border-neutral-200 focus:border-primary-500`;
      case 'filled':
        return `${baseClasses} bg-neutral-100 border-neutral-200 focus:border-primary-500 focus:bg-neutral-50`;
      case 'outlined':
        return `${baseClasses} bg-transparent border-neutral-300 focus:border-primary-500`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-3 text-sm min-h-[48px]';
      case 'md':
        return 'px-4 py-5 text-base min-h-[56px]';
      case 'lg':
        return 'px-4 py-6 text-lg min-h-[64px]';
      default:
        return 'px-4 py-5 text-base min-h-[56px]';
    }
  };

  const getInputClasses = () => {
    const baseClasses = [
      getVariantClasses(),
      getSizeClasses(),
      fullWidth ? 'w-full' : '',
      error ? 'border-error-500' : '',
      'text-neutral-900',
      className,
    ].filter(Boolean).join(' ');

    return baseClasses;
  };

  const getLabelClasses = () => {
    const baseClasses = 'text-sm font-medium mb-1';
    const colorClasses = error ? 'text-error-600' : 'text-neutral-700';
    
    return `${baseClasses} ${colorClasses} ${labelClassName}`;
  };

  const getErrorClasses = () => {
    return `text-sm text-error-600 mt-1 ${errorClassName}`;
  };

  const getHelperClasses = () => {
    return `text-sm text-neutral-500 mt-1 ${helperClassName}`;
  };

  return (
    <View className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <Text className={getLabelClasses()}>
          {label}
        </Text>
      )}
      
      <View className="relative">
        {leftIcon && (
          <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          className={getInputClasses()}
          style={[
            leftIcon ? { paddingLeft: 48 } : {},
            rightIcon ? { paddingRight: 48 } : {},
            style,
          ]}
          placeholderTextColor={theme.colors.neutral[400]}
          {...props}
        />
        
        {rightIcon && (
          <View className="absolute right-3 top-0 bottom-0 justify-center z-10">
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text className={getErrorClasses()}>
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text className={getHelperClasses()}>
          {helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input; 