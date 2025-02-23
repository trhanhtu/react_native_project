import { Layout, Text } from "@ui-kitten/components";
import React, { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";

interface PeriodicTableFrameProps {
    elementUIs: React.ReactNode[],
    contentForInfoBox?: React.ReactNode,
}

const PeriodicTableFrame: React.FC<PeriodicTableFrameProps> =
    ({ contentForInfoBox = <React.Fragment />, elementUIs }) => {
        const tailwind = useTailwind();
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
                style={tailwind(" h-85p flex mb-2 bg-transparent")}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    style={{ height: '100%' }}>
                    <View id="row_0_to_2" style={tailwind("flex flex-row bg-transparent")}>
                        {RenderElementNo1To12(elementUIs, tailwind)}
                        {RenderInfoBox(contentForInfoBox, tailwind)}
                        {RenderElementNo2To13AndSupplyRiskBox(elementUIs, tailwind)}
                    </View>

                    <View id="row_3_to_6">
                        <Layout id="row_3" style={tailwind("flex flex-row justify-between bg-transparent")}>
                            {elementUIs.slice(18, 36)}
                        </Layout>
                        <Layout id="row_4" style={tailwind("flex flex-row justify-between bg-transparent")}>
                            {elementUIs.slice(36, 54)}
                        </Layout>
                        <Layout id="row_5" style={tailwind("flex flex-row justify-between bg-transparent")}>
                            {[elementUIs[54], elementUIs[55], elementUIs.slice(70, 86)]}
                        </Layout>
                        <Layout id="row_6" style={tailwind("flex flex-row justify-between bg-transparent")}>
                            {[elementUIs[86], elementUIs[87], ...elementUIs.slice(102, 118)]}
                        </Layout>
                    </View>

                    <View id="row_7_to_8" style={tailwind("pt-4")}>
                        <Layout id="row_7" style={tailwind("flex flex-row justify-center bg-transparent")}>
                            {elementUIs.slice(56, 70)}
                        </Layout>
                        <Layout id="row_8" style={tailwind("flex flex-row justify-center bg-transparent")}>
                            {elementUIs.slice(88, 102)}
                        </Layout>
                    </View>
                </ScrollView>
            </ScrollView>
        );
    };

export default PeriodicTableFrame;



function RenderElementNo2To13AndSupplyRiskBox(elementUIs: ReactNode[], tailwind: (_classNames: string) => Style): ReactNode {
    return (
        <View>
            <Layout id="row_1" style={tailwind("flex flex-row")} >
                <View id="supply box" style={tailwind("flex-1 bg-gray-200/100")}>
                    <Text>Supply box</Text>
                </View>
                {elementUIs[1]}
            </Layout>
            <Layout id="row_2" style={tailwind("flex flex-row bg-transparent")}>
                {elementUIs.slice(4, 10)}
            </Layout>
            <Layout id="row_3" style={tailwind("flex flex-row bg-transparent")}>
                {elementUIs.slice(12, 18)}
            </Layout>
        </View>
    )
}

function RenderInfoBox(contentForInfoBox: ReactNode, tailwind: (_classNames: string) => Style): ReactNode {
    return (
        <View style={tailwind("flex-1 ")}>
            {contentForInfoBox}
        </View>
    )
}

function RenderElementNo1To12(elementUIs: ReactNode[], tailwind: (_classNames: string) => Style): ReactNode {
    return (
        <View>
            {elementUIs[0]}
            <Layout style={tailwind("flex flex-row bg-transparent")}>
                {elementUIs[2]}
                {elementUIs[3]}
            </Layout>
            <Layout style={tailwind("flex flex-row bg-transparent")}>
                {elementUIs[10]}
                {elementUIs[11]}

            </Layout>
        </View>
    )
}

function RenderSupplyRiskBoxAndElementNo2(elementUIs: ReactNode[], tailwind: (_classNames: string) => Style): ReactNode {
    return (
        <View></View>
    )
}