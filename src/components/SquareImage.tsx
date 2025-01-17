import React, { useLayoutEffect, useState } from "react";
import { Image, ImageSourcePropType, ImageStyle, StyleProp } from "react-native";
import { useLayout } from "../context/ApplicationLayoutProvider";

const SquareImage: React.FC<{ percent: number, src?: ImageSourcePropType, customStyle?: StyleProp<ImageStyle> }> = React.memo(
    ({ percent, src, customStyle }) => {

        const { windowDimensions } = useLayout()
        const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

        useLayoutEffect(() => {
            if (windowDimensions?.width) {
                const calculatedSize = windowDimensions.width * percent; // 70% of the width
                setImageSize({ width: calculatedSize, height: calculatedSize }); // Set both width and height to the same value
            }
        }, [windowDimensions]);
        return (
            <Image
                resizeMode="contain"
                source={src}
                style={[customStyle, { width: imageSize.width, height: imageSize.height }]}
            />
        )
    }
)

export default SquareImage;