import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface CustomErrorToastProps {
  message: string; // Error message to display
  visible: boolean; // Controls the visibility of the toast
  onDismiss?: () => void; // Optional callback when the toast disappears
}

const CustomErrorToast: React.FC<CustomErrorToastProps> = ({ message, visible, onDismiss }) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Fade animation

  useEffect(() => {
    if (visible) {
      // Fade in the toast
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Automatically hide after 5 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onDismiss) onDismiss();
        });
      }, 5000);

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [visible, fadeAnim, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { opacity: fadeAnim }, // Apply fade animation
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: '5%',
    alignSelf: 'center',
    backgroundColor: 'red',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CustomErrorToast;
