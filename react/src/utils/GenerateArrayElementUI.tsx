import { Layout, Text } from "@ui-kitten/components";
import { Href, Router } from "expo-router";
import { Pressable } from "react-native";
import { Style } from "tailwind-rn";
import GetBackgroundColor from "./GetBackgoundColor";
import { CellElement_t } from "./types";

export default function GenerateElementUIs(elements: CellElement_t[], tailwind: (_classNames: string) => Style, router: Router,): React.ReactNode[] {
    return elements.map((element, index) => {
        const [elementBg, labelBg] = GetBackgroundColor(element);
        return (
            <Layout
                key={`element ${index}`}
                style={[
                    tailwind(elementBg),
                    {
                        marginVertical: 1,
                        marginHorizontal: 1,
                        width: 100,
                        height: 100,
                        overflow: 'hidden',
                    },
                ]}
            >
                <Pressable
                    onPress={() => router.push(`/detailelement/${element.atomicNumber}` as Href)}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                    <Text
                        category="h2"
                        style={[
                            tailwind("text-black/100"),
                            { textAlign: "center" },
                        ]}
                    >
                        {element.symbol}
                    </Text>

                    <Layout style={[tailwind(labelBg), { width: '100%', paddingVertical: 2 }]}>
                        <Text style={tailwind("text-lg text-center text-white/100")}>
                            {element.atomicNumber}
                        </Text>
                    </Layout>
                </Pressable>

            </Layout>
        );

    })
}