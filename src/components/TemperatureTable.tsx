import Slider from '@react-native-community/slider';
import { Input, Layout, Text } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import CustomStyles from '../utils/styles';
import { ViewElement_t } from '../utils/types';
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const TemperatureTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const [currentTemperature, setCurrentTemperature] = React.useState<number>(0);
        if (loading) {
            return (
                <LoadingBars />
            )
        }

        return (
            <View style={tailwind("flex-1 flex-col p-2")}>
                <PeriodicTableFrame contentForInfoBox={RenderInfoBox(tailwind)} elementUIs={GenerateElementUIs(elements, currentTemperature, tailwind)} />
                <Layout style={[CustomStyles.shadow, tailwind("flex-1 bg-gray-300/100 rounded-3xl flex-row flex-wrap justify-center")]}>
                    <Slider
                        style={{ paddingLeft: 5, width: 600, height: 40 }}
                        value={currentTemperature}
                        onValueChange={(v: number) => setCurrentTemperature(v)}
                        minimumValue={0}
                        maximumValue={6000}
                        step={1}
                        minimumTrackTintColor="#FF0000FF"
                        maximumTrackTintColor="#0000FFFF"
                        thumbTintColor='#FF0000FF'
                    />
                    <Input value={currentTemperature.toString()} />
                </Layout>
            </View>
        )
    }
)
export default TemperatureTable;

function GenerateElementUIs(elements: ViewElement_t[], currentTemperature: number, tailwind: (_classNames: string) => Style,): React.ReactNode[] {
    return elements.map((element, index) => {
        const elementBg = GetBackgroundColor(element, currentTemperature);
        return (
            <Layout key={index} style={[tailwind(elementBg), { marginVertical: 1, marginHorizontal: 1, width: 100, height: 100 }]}>
                <Text category="h3" style={{ flex: 1, alignContent: "center", textAlign: "center" }}>{element.symbol}</Text>
                <Text style={tailwind(`text-lg text-center ${elementBg} text-black/100`)}>{element.atomicNumber}</Text>
            </Layout>
        )
    })
}

function GetBackgroundColor(element: ViewElement_t, currentTemperature: number): string {
    if (element.boilingPoint === element.meltingPoint && ~~element.meltingPoint === 0)
        return "bg-gray-300/100";
    if (currentTemperature < element.meltingPoint)
        return "bg-blue-300/100";
    if (currentTemperature > element.boilingPoint)
        return "bg-lime-300/100";
    return "bg-blue-500/100";
}

function RenderInfoBox(tailwind: (_classNames: string) => Style): React.ReactNode {
    return (
        <View style={tailwind("flex-1 bg-white/100 flex-row")}>
            <Layout style={tailwind("border-4 flex-1 bg-blue-300/100 justify-center items-center m-5p")}>
                <Text category='h1'>Rắn</Text>
            </Layout>
            <Layout style={tailwind("border-4 flex-1 bg-blue-500/100 justify-center items-center m-5p")}>
                <Text category='h1'>Lỏng</Text>
            </Layout>
            <Layout style={tailwind("border-4 flex-1 bg-lime-300/100 justify-center items-center m-5p")}>
                <Text category='h1'>Khí</Text>
            </Layout>
            <Layout style={tailwind("border-4 flex-1 bg-gray-300/100 justify-center items-center text-wrap m-5p")}>
                <Text category='h1' style={tailwind("text-wrap text-center")}>Không biết</Text>
            </Layout>

        </View>
    )
}