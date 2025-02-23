import { Layout, Text } from "@ui-kitten/components";
import { Style } from "tailwind-rn";
import GetBackgroundColor from "./GetBackgoundColor";
import { ViewElement_t } from "./types";

export default function GenerateElementUIs(elements: ViewElement_t[], tailwind: (_classNames: string) => Style,): React.ReactNode[] {
    return elements.map((element, index) => {
        const [elementBg, labelBg] = GetBackgroundColor(element);
        return (
            <Layout key={index} style={[tailwind(elementBg), { marginVertical: 1, marginHorizontal: 1, width: 100, height: 100 }]}>
                <Text category="h3" style={{ flex: 1, alignContent: "center", textAlign: "center" }}>{element.symbol}</Text>
                <Text style={tailwind(`text-lg text-center ${labelBg} text-white/100`)}>{element.atomicNumber}</Text>
            </Layout>
        )
    })
}