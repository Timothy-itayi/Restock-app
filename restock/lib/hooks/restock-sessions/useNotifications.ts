import { useState, useCallback } from 'react';
import { Animated } from 'react-native';
import { Notification } from '../../utils/restock-sessions/types';
import { Logger } from '../../utils/restock-sessions/logger';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationAnimation] = useState(new Animated.Value(0));

  const removeNotification = useCallback((id: string) => {
    Logger.debug(`Removing notification`, { id });
    
    // Animate out
    Animated.timing(notificationAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    });
  }, [notificationAnimation]);

  const showNotification = useCallback((
    type: Notification['type'], 
    message: string, 
    title?: string
  ) => {
    Logger.info(`Showing notification`, { type, message, title });
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      title,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Animate in
    Animated.timing(notificationAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 4000);
  }, [notificationAnimation, removeNotification]);

  const getNotificationStyles = useCallback((type: Notification['type']) => {
    // This will be replaced with actual styles from the component
    switch (type) {
      case 'success':
        return {
          iconText: '✓',
        };
      case 'info':
        return {
          iconText: 'ℹ',
        };
      case 'warning':
        return {
          iconText: '⚠',
        };
      case 'error':
        return {
          iconText: '✕',
        };
      default:
        return {
          iconText: 'ℹ',
        };
    }
  }, []);

  const clearAllNotifications = useCallback(() => {
    Logger.debug('Clearing all notifications');
    setNotifications([]);
  }, []);

  return {
    // State
    notifications,
    notificationAnimation,
    
    // Actions
    showNotification,
    removeNotification,
    getNotificationStyles,
    clearAllNotifications
  };
};