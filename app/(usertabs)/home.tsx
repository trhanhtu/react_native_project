import useHome from "@/src/hooks/useHome";
import { Layout, Text } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";

export default function HomeScreen() {
    const tailwind = useTailwind();
    const {
        handleViewDetail,
        elementHeight,
        elementWidth,
    } = useHome()

    return (
        <Layout style={tailwind("flex-1 bg-green-200/100 items-center")}>
            <PeriodicTableFrame spaceHeight={elementHeight} tailwind={tailwind} elementsTemplate={GenerateDummyElementUIs(elementHeight, elementWidth)} />
        </Layout>
    )
}

interface PeriodicTableFrameProps {
    spaceHeight: number,
    tailwind: (_classNames: string) => Style,
    elementsTemplate: React.ReactNode[],
}

const PeriodicTableFrame: React.FC<PeriodicTableFrameProps> = React.memo(
    ({ spaceHeight, elementsTemplate, tailwind }) => {
        return (
            <Layout id="table" style={tailwind("bg-white/100 h-80p")}>
                <Layout id="row_1" style={[ tailwind("flex flex-row justify-between")]}>
                    {elementsTemplate[0]}
                    {elementsTemplate[1]}
                </Layout>
                <Layout id="row_2" style={tailwind("flex flex-row justify-between")}>

                    <Layout style={tailwind("flex flex-row")}>
                        {elementsTemplate[2]}
                        {elementsTemplate[3]}
                    </Layout>
                    <Layout style={tailwind("flex flex-row")}>
                        {elementsTemplate.slice(4, 10)}
                    </Layout>
                </Layout>
                <Layout id="row_3" style={tailwind("flex flex-row justify-between")}>

                    <Layout style={tailwind("flex flex-row")}>
                        {elementsTemplate[10]}
                        {elementsTemplate[11]}
                    </Layout>
                    <Layout style={tailwind("flex flex-row")}>
                        {elementsTemplate.slice(12, 18)}

                    </Layout>

                </Layout>
                <Layout id="row_4" style={tailwind("flex flex-row justify-between")}>
                    {elementsTemplate.slice(18, 36)}
                </Layout>
                <Layout id="row_5" style={tailwind("flex flex-row justify-between")}>
                    {elementsTemplate.slice(36, 54)}
                </Layout>
                <Layout id="row_6" style={tailwind("flex flex-row justify-between")}>
                    {[elementsTemplate[54], elementsTemplate[55], elementsTemplate.slice(70, 86)]}

                </Layout>
                <Layout id="row_7" style={tailwind("flex flex-row justify-between")}>
                    {[elementsTemplate[86], elementsTemplate[87], ...elementsTemplate.slice(102, 118)]}
                </Layout>
                <View style={{ paddingTop: spaceHeight/4 }}>

                    <Layout id="row_8" style={tailwind("flex flex-row justify-center")}>
                        {elementsTemplate.slice(56, 70)}
                    </Layout>
                    <Layout id="row_9" style={tailwind("flex flex-row justify-center")}>
                        {elementsTemplate.slice(88, 102)}

                    </Layout>
                </View>
            </Layout>
        )
    }
)

function GenerateDummyElementUIs(elementHeight: number, elementWidth: number): React.ReactNode[] {
    const elementUIs = Array.from({ length: 118 }, (_, index) => {
        return (
            <Layout key={index} style={{ marginVertical: 1, marginHorizontal: 1, width: elementWidth, height: elementHeight }}>
                <Text style={{ flex: 1, alignContent: "center", textAlign: "center", backgroundColor: "red" }}>{index + 1}</Text>
            </Layout>
        )
    }
    )
    return elementUIs;
}