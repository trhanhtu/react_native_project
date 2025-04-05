import { Layout, Text } from "@ui-kitten/components";
import { Href, Router } from "expo-router";
import { Pressable } from "react-native";
import { Style } from "tailwind-rn";
import GetBackgroundColor from "./GetBackgoundColor";
import { ViewElement_t } from "./types";

export default function GenerateElementUIs(elements: ViewElement_t[], tailwind: (_classNames: string) => Style, router: Router,): React.ReactNode[] {
    return elements.map((element, index) => {
        const [elementBg, labelBg] = GetBackgroundColor(element);
        
        return (
            <Layout key={`element ${index}`} style={[tailwind(elementBg), { marginVertical: 1, marginHorizontal: 1, width: 100, height: 100 }]}>
                <Pressable onPress={() => router.push(`/detailelement/${element.atomicNumber}` as Href)}>
                    <Text category="h3" style={{ flex: 1, alignContent: "center", textAlign: "center" }}>{element.symbol}</Text>
                    <Text style={tailwind(`text-lg text-center ${labelBg} text-white/100`)}>{element.atomicNumber}</Text>
                </Pressable>
            </Layout>
        )
    })
}