import React, { useEffect, useRef } from 'react';
import { Animated, Platform } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

interface ZoomableComponentProps {
  children: React.ReactNode;
  initialZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

const ZoomableComponent: React.FC<ZoomableComponentProps> = ({ 
  children, 
  initialZoom = 0.5,
  onZoomChange
}) => {
  // Scale value for zooming
  const scale = useRef(new Animated.Value(initialZoom)).current;
  // Last scale value after gesture
  const lastScale = useRef(initialZoom);
  
  // Update scale when initialZoom changes
  useEffect(() => {
    scale.setValue(initialZoom);
    lastScale.current = initialZoom;
  }, [initialZoom]);
  
  // Handle pinch gesture for zooming
  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );
  
  // Handle state changes for pinch gesture
  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // Update last scale value
      lastScale.current *= event.nativeEvent.scale;
      // Reset scale animated value
      scale.setValue(lastScale.current);
      
      // Notify parent of zoom change
      if (onZoomChange) {
        onZoomChange(lastScale.current);
      }
    }
  };
  
  // For web platform, use a simple animated view
  if (Platform.OS === "web") {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    );
  }
  
  // For mobile platforms, use pinch gesture handler
  return (
    <PinchGestureHandler
      onGestureEvent={onPinchEvent}
      onHandlerStateChange={onPinchStateChange}
    >
      <Animated.View 
        style={{ 
          transform: [{ scale }],
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
};

export default ZoomableComponent;