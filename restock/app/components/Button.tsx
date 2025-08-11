import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'navigation' | 'quickAction' | 'auth' | 'edit' | 'signOut';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  textClassName = '',
  style,
  textStyle,
}) => {
  const getVariantClasses = () => {
    const baseClasses = 'rounded-lg items-center justify-center';
    
    switch (variant) {
      case 'navigation':
        return `${baseClasses} bg-buttons-navigation ${disabled ? 'bg-buttons-navigation/50' : 'active:bg-buttons-navigation/90'}`;
      case 'quickAction':
        return `${baseClasses} bg-buttons-quickAction ${disabled ? 'bg-buttons-quickAction/50' : 'active:bg-buttons-quickAction/90'}`;
      case 'auth':
        return `${baseClasses} bg-buttons-auth ${disabled ? 'bg-buttons-auth/50' : 'active:bg-buttons-auth/90'}`;
      case 'edit':
        return `${baseClasses} bg-buttons-edit ${disabled ? 'bg-buttons-edit/50' : 'active:bg-buttons-edit/90'}`;
      case 'signOut':
        return `${baseClasses} bg-buttons-signOut ${disabled ? 'bg-buttons-signOut/50' : 'active:bg-buttons-signOut/90'}`;
      case 'primary':
        return `${baseClasses} bg-buttons-primary ${disabled ? 'bg-buttons-primary/50' : 'active:bg-buttons-primary/90'}`;
      case 'secondary':
        return `${baseClasses} bg-buttons-secondary ${disabled ? 'bg-buttons-secondary/50' : 'active:bg-buttons-secondary/90'}`;
      case 'outline':
        return `${baseClasses} bg-transparent border border-primary-300 ${disabled ? 'border-primary-200' : 'active:bg-primary-50'}`;
      case 'ghost':
        return `${baseClasses} bg-transparent ${disabled ? '' : 'active:bg-primary-100'}`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2';
      case 'md':
        return 'px-4 py-3';
      case 'lg':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  const getTextClasses = () => {
    const baseClasses = 'font-satoshi-medium text-center';
    
    switch (variant) {
      case 'navigation':
      case 'quickAction':
      case 'auth':
      case 'edit':
      case 'signOut':
      case 'primary':
        return `${baseClasses} text-white ${disabled ? 'text-white/70' : ''}`;
      case 'secondary':
        return `${baseClasses} text-text-primary ${disabled ? 'text-text-primary/70' : ''}`;
      case 'outline':
        return `${baseClasses} text-primary-600 ${disabled ? 'text-primary-400' : ''}`;
      case 'ghost':
        return `${baseClasses} text-primary-600 ${disabled ? 'text-primary-400' : ''}`;
      default:
        return baseClasses;
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const buttonClasses = [
    getVariantClasses(),
    getSizeClasses(),
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50' : '',
    className,
  ].filter(Boolean).join(' ');

  const textClasses = [
    getTextClasses(),
    getTextSizeClasses(),
    textClassName,
  ].filter(Boolean).join(' ');


  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={style}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' ? theme.neutral.darkest : theme.neutral.lightest} 
        />
      ) : (
        <Text className={textClasses} style={textStyle}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button; 