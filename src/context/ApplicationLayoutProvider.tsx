import * as ScreenOrientation from 'expo-screen-orientation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button, Dimensions, Platform, View } from 'react-native';

const LayoutContext = createContext<any>(null);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
    // Default dimensions: fixed for web, dynamic for mobile
    const defaultDimensions = Platform.OS === 'web'
        ? { width: 380, height: 800 }  // Fixed dimensions for web
        : Dimensions.get('window');    // Dynamic dimensions for mobile

    const [windowDimensions, setWindowDimensions] = useState(defaultDimensions);

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
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    const lockLandscape = () => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    };

    const unlockOrientation = () => {
        ScreenOrientation.unlockAsync();
    };

    const renderWebChildren = () => (
        <React.Fragment>

            <View style={{
                borderColor: "black",
                borderWidth: 2,  // Adding border width
                width: windowDimensions.width,
                height: windowDimensions.height,
                margin: "auto"
            }}>
                {children}

                {/* Rotating Button */}
            </View>
            <View>
                <Button title='Xoay màn hình' onPress={() => setWindowDimensions({ width: windowDimensions.height, height: windowDimensions.width })} />
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
export const useLayout = () => {
    return useContext(LayoutContext);
};