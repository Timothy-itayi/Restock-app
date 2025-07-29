import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  style,
}) => {
  const getVariantClasses = () => {
    const baseClasses = 'rounded-xl';
    
    switch (variant) {
      case 'default':
        return `${baseClasses} bg-neutral-50 border border-neutral-200 shadow-soft`;
      case 'elevated':
        return `${baseClasses} bg-neutral-50 shadow-medium`;
      case 'outlined':
        return `${baseClasses} bg-neutral-50 border border-neutral-200`;
      default:
        return baseClasses;
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const cardClasses = [
    getVariantClasses(),
    getPaddingClasses(),
    className,
  ].filter(Boolean).join(' ');

  return (
    <View className={cardClasses} style={style}>
      {(title || subtitle) && (
        <View className="mb-4">
          {title && (
            <Text className={`text-lg font-semibold text-neutral-900 ${titleClassName}`}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className={`text-sm text-neutral-600 mt-1 ${subtitleClassName}`}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
};

export default Card; 