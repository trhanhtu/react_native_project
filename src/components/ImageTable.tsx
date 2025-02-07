import { Layout, Text } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import { ViewElement_t } from "../utils/types";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ImageTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        if (loading) {
            return (
                <View style={tailwind("flex-1 flex-column")}>
                    <Text>Loading...</Text>
                </View>
            )
        }
        return (
            <View style={tailwind("flex-1 flex-col p-2")}>
                <PeriodicTableFrame spaceHeight={100} elementUIs={GenerateElementUIs(elements, tailwind)} />
                <Layout style={tailwind("flex-1 bg-red-500/100")}>
                    <Text>controller</Text>
                </Layout>
            </View>
        )
    }
)
export default ImageTable;
function GenerateElementUIs(elements: ViewElement_t[], tailwind: (_classNames: string) => Style,): React.ReactNode[] {
    return elements.map((element, index) => {
        return (
            <Layout key={index} style={[tailwind(GetBackgroundColor(element)), { marginVertical: 1, marginHorizontal: 1, width: 100, height: 100 }]}>
                <Text category="h3" style={{ flex: 1, alignContent: "center", textAlign: "center" }}>{element.symbol}</Text>
                <Text style={tailwind("text-lg text-center bg-gray-700/80 text-white/100")}>{element.atomicNumber}</Text>
            </Layout>
        )
    })
}
function GetBackgroundColor(element: ViewElement_t): string {
    if (element.isLightOn) {
        return "bg-black/100"
    }
    switch (element.group) {
        case "1":
            if (element.atomicNumber === 1) return "bg-custom_oceanBlue/100";
            return "bg-custom_pinkBlush/100";
        case "2":
            return "bg-custom_softPink/100";
        case "3":
            if (element.atomicNumber === 57) return "bg-custom_skyAqua/100";
            if (element.atomicNumber === 89) return "bg-custom_limeGreen/100";
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "10":
        case "11":
        case "12":
            return "bg-custom_skyBlue/100";
        case "13":
            return "bg-custom_neonYellow/100";
        case "14":
            return "bg-custom_lavender/100";
        case "15":
            return "bg-custom_silverGray/100";
        case "16":
            return "bg-custom_sunsetOrange/100";
        case "17":
            return "bg-custom_peach/100";
        case "18":
            return "bg-custom_goldenYellow/100";
        case "act":
            return "bg-custom_limeGreen/100";
        case "lan":
            return "bg-custom_skyAqua/100";
        default:
            return "bg-white/100";
    }
}