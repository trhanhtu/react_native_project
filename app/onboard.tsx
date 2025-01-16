import { Layout, Text, ViewPager } from "@ui-kitten/components";
import React, { useState } from "react";
import { View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";

export default function OnboardScreen() {
    const tailwind = useTailwind();
    const [selectedIndex, setSelectedIndex] = useState(0);

    const shouldLoadComponent = (index: number): boolean => index === selectedIndex;

    return (
        <ViewPager
            style={tailwind("flex-1")}
            selectedIndex={selectedIndex}
            shouldLoadComponent={shouldLoadComponent}
            onSelect={index => setSelectedIndex(index)}
        >
            <Layout
                style={tailwind("flex-1")}
            >
                <View style={tailwind("flex-1 justify-center items-center")}>
                    <Text category='h5'>
                        Tab 1
                    </Text>

                </View>
                {RenderCurrentPageIndex(0, tailwind)}
            </Layout>
            <Layout
                style={tailwind("flex-1 bg-green-200/100")}
            >
                <View style={tailwind("flex-1 justify-center items-center")}>
                    <Text category='h5'>
                        Tab 2
                    </Text>

                </View>
                {RenderCurrentPageIndex(1, tailwind)}
            </Layout>
        </ViewPager>
    );
}

function RenderCurrentPageIndex(currentIndex: number, tailwind: (_classNames: string) => Style): React.ReactNode {
    return (
        <View style={tailwind("w-full flex flex-row justify-center items-center")}>
            {
                Array.from({ length: 3 }, (_, index) =>
                    <View key={index} style={[tailwind(`w-5 h-3 ${currentIndex === index ? "bg-blue-500/100" : "bg-gray-600/100"} m-2 flex`), {
                        transform: [
                            { skewX: `-20deg` } // Convert -20 degrees to radians
                        ],
                    }]}></View>
                )
            }
        </View>
    )
}