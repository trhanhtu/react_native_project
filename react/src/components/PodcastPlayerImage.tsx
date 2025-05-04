import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ImageStyle, View, ViewStyle } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface Props {
    imageUrl: string;
    size?: number;
    style?: ViewStyle | ImageStyle;
}

const PodcastPlayerImage: React.FC<Props> = ({ imageUrl, size = 240, style }) => {
    const tailwind = useTailwind();
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const spinAnimation = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 30000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            { iterations: Infinity }
        );
        spinAnimation.start();

        return () => {
            spinAnimation.stop();
            spinValue.setValue(0);
        };
    }, [spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const imageDynamicStyle = {
        width: size,
        height: size,
    };

    // Create a container with a gradient background
    return (
        <View style={[tailwind('items-center justify-center'), { width: size + 20, height: size + 20 }]}>
            <LinearGradient
                colors={['#9333ea', '#4f46e5']}
                style={[
                    tailwind('rounded-full items-center justify-center'),
                    { width: size + 20, height: size + 20 },
                    CustomStyles.shadow
                ]}
            >
                <Animated.Image
                    source={{ uri: imageUrl }}
                    style={[
                        tailwind('rounded-full border-4 border-gray-900/100'),
                        imageDynamicStyle,
                        { transform: [{ rotate: spin }] },
                    ]}
                    resizeMode="cover"
                />
            </LinearGradient>
        </View>
    );
};

const CustomStyles = {
    shadow: {
        shadowColor: '#9333ea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 15,
    },
};

export default PodcastPlayerImage;