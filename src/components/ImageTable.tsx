import { Layout, Text } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import CustomStyles from "../utils/styles";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ImageTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        if (loading) {
            return (
                <LoadingBars />
            )
        }
        return (
            <View style={tailwind("flex-1 flex-col p-2")}>
                <PeriodicTableFrame elementUIs={GenerateElementUIs(elements, tailwind)} />
                <Layout style={[CustomStyles.shadow, tailwind("flex-1 bg-gray-400/100 rounded-3xl text-center")]}>
                    <Text style={tailwind("text-center")}>controller</Text>
                </Layout>
            </View>
        )
    }
)
export default ImageTable;

