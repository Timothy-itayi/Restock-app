import React from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore from '@/app/stores/useThemeStore';

interface SkeletonBoxProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  backgroundColor?: string;
}

const SkeletonBox: React.FC<SkeletonBoxProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style,
  backgroundColor
}) => {
  const { theme, mode } = useThemeStore();
  const shimmerAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 2000, // 2 seconds as requested
        useNativeDriver: false,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200], // Move from left to right
  });

  return (
    <View
      style={[
        styles.skeletonBox,
        {
          width,
          height,
          borderRadius,
          backgroundColor: backgroundColor || (mode === 'dark' ? theme.neutral.dark : '#e9ecef'),
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.6)',
            'rgba(255, 255, 255, 0.3)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBox: {
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
});

export default SkeletonBox; 