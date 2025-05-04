import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ImageTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const router = useRouter();
        elements.forEach((e) => {
            e.isLightOn = true;
        })
        if (loading) {
            return (
                <LoadingBars />
            )
        }
        return (
            <View style={tailwind("flex-1 flex-col p-2")}>
                <PeriodicTableFrame elementUIs={GenerateElementUIs(elements, tailwind, router)} />

            </View>
        )
    }
)
export default ImageTable;

