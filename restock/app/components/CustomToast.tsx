import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { toastStyles } from '../../styles/components';

interface ToastAction {
  label: string;
  onPress: () => void;
  primary?: boolean;
}

interface CustomToastProps {
  visible: boolean;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  actions?: ToastAction[];
  onDismiss?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  type,
  title,
  message,
  actions,
  onDismiss,
  autoDismiss = true,
  duration = 5000,
}) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getToastStyle = () => {
    switch (type) {
      case 'success': return toastStyles.toastSuccess;
      case 'info': return toastStyles.toastInfo;
      case 'warning': return toastStyles.toastWarning;
      case 'error': return toastStyles.toastError;
    }
  };

  const getIconStyle = () => {
    switch (type) {
      case 'success': return toastStyles.iconSuccess;
      case 'info': return toastStyles.iconInfo;
      case 'warning': return toastStyles.iconWarning;
      case 'error': return toastStyles.iconError;
    }
  };

  const getIconText = () => {
    switch (type) {
      case 'success': return '✓';
      case 'info': return 'ℹ';
      case 'warning': return '⚠';
      case 'error': return '✕';
    }
  };

  useEffect(() => {
    if (visible) {
      // Slide in from bottom
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
  }, [visible]);

  const hideToast = () => {
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
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        toastStyles.toastContainer,
        getToastStyle(),
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={toastStyles.toastContent}>
        <View style={[toastStyles.toastIcon, getIconStyle()]}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
            {getIconText()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={toastStyles.toastText}>{title}</Text>
          {message && (
            <Text style={toastStyles.toastSubtext}>{message}</Text>
          )}
        </View>
      </View>

      {actions && actions.length > 0 && (
        <View style={toastStyles.toastActions}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                toastStyles.toastButton,
                action.primary ? toastStyles.primaryButton : toastStyles.secondaryButton,
              ]}
              onPress={() => {
                action.onPress();
                if (!action.primary) {
                  hideToast();
                }
              }}
            >
              <Text
                style={[
                  toastStyles.toastButtonText,
                  action.primary ? toastStyles.primaryButtonText : toastStyles.secondaryButtonText,
                ]}
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