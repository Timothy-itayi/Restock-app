import React, { useEffect, useRef, useCallback } from 'react';
import {
    Animated,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ToastAction {
  label: string;
  onPress: () => void;
  primary?: boolean;
}

interface CustomToastProps {
  visible?: boolean;
  type?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message?: string;
  actions?: ToastAction[];
  onDismiss?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

const CustomToast: React.FC<CustomToastProps> = (props) => {
  const {
    visible = false,
    type = 'info',
    title = '',
    message = '',
    actions,
    onDismiss,
    autoDismiss = true,
    duration = 5000,
  } = props || {};
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  }, [slideAnim, opacityAnim, onDismiss]);

  const getToastClasses = () => {
    const baseClasses = "absolute top-15 left-4 right-4 bg-neutral-50 rounded-2xl p-4 mx-4 shadow-medium border border-neutral-200 z-50";
    
    switch (type) {
      case 'success': return `${baseClasses} border-l-4 border-l-success-500`;
      case 'info': return `${baseClasses} border-l-4 border-l-primary-500`;
      case 'warning': return `${baseClasses} border-l-4 border-l-warning-500`;
      case 'error': return `${baseClasses} border-l-4 border-l-error-500`;
      default: return baseClasses;
    }
  };

  const getIconClasses = () => {
    const baseClasses = "w-10 h-10 rounded-full justify-center items-center flex-shrink-0";
    
    switch (type) {
      case 'success': return `${baseClasses} bg-success-500`;
      case 'info': return `${baseClasses} bg-primary-500`;
      case 'warning': return `${baseClasses} bg-warning-500`;
      case 'error': return `${baseClasses} bg-error-500`;
      default: return `${baseClasses} bg-neutral-500`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'info': return 'information-circle';
      case 'warning': return 'warning';
      case 'error': return 'close-circle';
    }
  };

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss if enabled
      if (autoDismiss && !actions) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible, autoDismiss, actions, duration, hideToast, slideAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      className={getToastClasses()}
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      {/* Close button */}
      <TouchableOpacity
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-neutral-100 justify-center items-center"
        onPress={hideToast}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={16} color={theme.colors.neutral[500]} />
      </TouchableOpacity>

      <View className="flex-row items-start gap-3">
        <View className={getIconClasses()}>
          <Ionicons 
            name={getIcon() as any} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-neutral-800 leading-6 flex-1">
            {title}
          </Text>
          {message && (
            <Text className="text-sm text-neutral-500 leading-5 mt-0.5 flex-1">
              {message}
            </Text>
          )}
        </View>
      </View>

      {actions && actions.length > 0 && (
        <View className="flex-row justify-end gap-2 mt-3 pt-3 border-t border-neutral-200">
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              className={`px-4 py-2 rounded-lg min-w-20 items-center ${
                action.primary 
                  ? 'bg-primary-500' 
                  : 'bg-transparent border border-neutral-300'
              }`}
              onPress={() => {
                action.onPress();
                if (!action.primary) {
                  hideToast();
                }
              }}
              activeOpacity={0.8}
            >
              <Text
                className={`text-sm font-medium ${
                  action.primary 
                    ? 'text-white' 
                    : 'text-neutral-600'
                }`}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

export default CustomToast; 