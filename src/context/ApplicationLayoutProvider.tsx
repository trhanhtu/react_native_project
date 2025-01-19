import * as ScreenOrientation from 'expo-screen-orientation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button, Dimensions, Platform, View } from 'react-native';

interface WindowDimensions {
  width: number;
  height: number;
}

interface LayoutContextType {
  windowDimensions: WindowDimensions;
  lockPortrait: () => void;
  lockLandscape: () => void;
  unlockOrientation: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  // Default dimensions: fixed for web, dynamic for mobile
  const defaultDimensions: WindowDimensions =
    Platform.OS === 'web'
      ? { width: 380, height: 800 } // Fixed dimensions for web
      : Dimensions.get('window'); // Dynamic dimensions for mobile

  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(defaultDimensions);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Lock to portrait on mobile
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

      const listener = Dimensions.addEventListener('change', () => {
        setWindowDimensions(Dimensions.get('window'));
      });

      return () => {
        listener.remove();
        ScreenOrientation.unlockAsync(); // Optionally unlock orientation when unmounting
      };
    }
  }, []);

  const lockPortrait = () => {
    if (Platform.OS === "web") {
      if (windowDimensions.width > windowDimensions.height) {
        rotateOnWeb();
      }
      return;
    }
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  };

  const lockLandscape = () => {
    if (Platform.OS === "web") {
      if (windowDimensions.width < windowDimensions.height) {
        rotateOnWeb();
      }
      return;
    }
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
  };

  const unlockOrientation = () => {
    ScreenOrientation.unlockAsync();
  };
  function rotateOnWeb() {
    setWindowDimensions({
      width: windowDimensions.height,
      height: windowDimensions.width,
    })
  }
  const renderWebChildren = () => (
    <React.Fragment>
      <View
        style={{
          borderColor: 'black',
          borderWidth: 2, // Adding border width
          width: windowDimensions.width,
          height: windowDimensions.height,
          margin: 'auto',
        }}
      >
        {children}
      </View>
      <View>
        <Button
          title="Xoay màn hình"
          onPress={rotateOnWeb}
        />
      </View>
    </React.Fragment>
  );

  return (
    <LayoutContext.Provider
      value={{
        windowDimensions,
        lockPortrait,
        lockLandscape,
        unlockOrientation,
      }}
    >
      {Platform.OS === 'web' ? renderWebChildren() : children}
    </LayoutContext.Provider>
  );
};

// Custom hook to access layout and orientation functions
export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
