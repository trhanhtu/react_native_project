import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

// Toast Context
const ToastContext = createContext({
  toastShow: (message: string, severity: 'info' | 'error' | 'success', time?: number) => {},
});

// ToastProvider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; severity: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toastShow = (message: string, severity: 'info' | 'error' | 'success', time = 5000) => {
    // Clear any previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set toast details and make it visible
    setToast({ message, severity });
    setVisible(true);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide the toast after the specified time
    timerRef.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        setToast(null);
      });
    }, time);
  };

  return (
    <ToastContext.Provider value={{ toastShow }}>
      {children}
      {visible && toast && (
        <Animated.View
          style={[
            styles.toast,
            { opacity: fadeAnim },
            toast.severity === 'error' && styles.error,
            toast.severity === 'success' && styles.success,
            toast.severity === 'info' && styles.info,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

// Hook to use the Toast
export const useToast = () => {
  return useContext(ToastContext);
};

// Styles
const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: '5%',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 1000,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    backgroundColor: 'red',
  },
  success: {
    backgroundColor: 'green',
  },
  info: {
    backgroundColor: 'blue',
  },
});
