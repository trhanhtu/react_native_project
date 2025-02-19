import { ProgressBar } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn";

const LoadingBars: React.FC = React.memo(
    () => {
        const tailwind = useTailwind();
        //  useProgress()
        return (
            <View style={tailwind("flex-1 flex-column")}>
                <ProgressBar style={tailwind("flex-1")} progress={0.6}/>
                <ProgressBar style={tailwind("flex-1")} progress={0.7} />
                <ProgressBar style={tailwind("flex-1")} progress={0.8} />
                <ProgressBar style={tailwind("flex-1")} progress={0.9} />
                <ProgressBar style={tailwind("flex-1")} progress={1} />
                <ProgressBar progress={0.9} />
            </View>
        )
    }
)

export default LoadingBars;