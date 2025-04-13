import { Layout, Text } from "@ui-kitten/components";
import { Href, Router, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GetBackgroundColor from "../utils/GetBackgoundColor";
import CustomStyles from "../utils/styles";
import { CellElement_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";


const PodcastTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const router = useRouter();
        if (loading) {
            return (
                <LoadingBars />
            )
        }

        return (
            <React.Fragment>

                <View style={tailwind("flex-1 p-2")}>
                    <PeriodicTableFrame elementUIs={GenerateElementUIs(elements.map((e,) => ({ ...e, isLightOn: true })), tailwind, router)} />
                </View>
                <View style={[CustomStyles.shadow,
                tailwind("absolute bottom-2 left-0 right-0 bg-transparent"),]}>
                    <Layout style={tailwind("flex items-center")}>
                    </Layout>

                </View>
            </React.Fragment>

        )
    }
)
export default PodcastTable;

function GenerateElementUIs(elements: CellElement_t[], tailwind: (_classNames: string) => Style, router: Router,): React.ReactNode[] {
    return elements.map((element, index) => {
        const [elementBg, labelBg] = GetBackgroundColor(element);

        return (
            <Layout key={`element ${index}`} style={[tailwind(elementBg), { marginVertical: 1, marginHorizontal: 1, width: 100, height: 100 }]}>
                <Pressable onPress={() => router.push(`/podcastlist/${element.elementName}` as Href)}>
                    <Text category="h3" style={{ flex: 1, alignContent: "center", textAlign: "center" }}>{element.symbol}</Text>
                    <Text style={tailwind(`text-lg text-center ${labelBg} text-white/100`)}>{element.atomicNumber}</Text>
                </Pressable>
            </Layout>
        )
    })
}