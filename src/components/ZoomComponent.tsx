// ZoomableComponent.tsx
import React, { useRef } from 'react';
import { Animated, Platform } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

const ZoomableComponent = ({ children }: { children: React.ReactNode }) => {
  // Giá trị scale khởi tạo là 1
  const scale = useRef(new Animated.Value(0.5)).current;
  // Lưu giá trị scale cuối cùng sau mỗi gesture
  const lastScale = useRef(1);

  // Xử lý sự kiện pinch gesture, cập nhật giá trị scale
  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  // Xử lý thay đổi trạng thái gesture
  const onPinchStateChange = (event: any) => {
    // Khi gesture kết thúc (oldState === ACTIVE)
    if (event.nativeEvent.oldState === State.ACTIVE) {
      // Cập nhật giá trị lastScale với tỷ lệ pinch mới
      lastScale.current *= event.nativeEvent.scale;
      // Đặt lại scale cho Animated.Value
      scale.setValue(lastScale.current);
    }
  };
  // On Web, return a normal View instead
  if (Platform.OS === "web") {
    return <Animated.View style={{ transform: [{ scale }] }}>
      {children}
    </Animated.View>
  }
  return (
    <PinchGestureHandler
      onGestureEvent={onPinchEvent}
      onHandlerStateChange={onPinchStateChange}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </PinchGestureHandler>
  );
};

export default ZoomableComponent;
