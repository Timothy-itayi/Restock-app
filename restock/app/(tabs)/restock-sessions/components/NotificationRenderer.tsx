import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Notification } from '../utils/types';
import { restockSessionsStyles } from '../../../../styles/components/restock-sessions';

interface NotificationRendererProps {
  notifications: Notification[];
  notificationAnimation: Animated.Value;
  onRemoveNotification: (id: string) => void;
  getNotificationStyles: (type: Notification['type']) => any;
}

export const NotificationRenderer: React.FC<NotificationRendererProps> = ({
  notifications,
  notificationAnimation,
  onRemoveNotification,
  getNotificationStyles
}) => {
  const renderNotification = (notification: Notification) => {
    const styles = getNotificationStyles(notification.type);
    
    return (
      <Animated.View
        key={notification.id}
        style={[
          restockSessionsStyles.notificationContainer,
          styles.container,
          {
            transform: [{
              translateY: notificationAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              })
            }]
          }
        ]}
      >
        <View style={restockSessionsStyles.notificationContent}>
          <View style={[restockSessionsStyles.notificationIcon, styles.icon]}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
              {styles.iconText}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={restockSessionsStyles.notificationText}>
              {notification.message}
            </Text>
            {notification.title && (
              <Text style={[restockSessionsStyles.notificationText, { fontSize: 11, color: '#FFFFFF', marginTop: 1, opacity: 0.9 }]}>
                {notification.title}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={restockSessionsStyles.notificationClose}
            onPress={() => onRemoveNotification(notification.id)}
          >
            <Text style={restockSessionsStyles.notificationCloseText}>×</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <>
      {notifications.map(renderNotification)}
    </>
  );
};