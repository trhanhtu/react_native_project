import Slider from '@react-native-community/slider';
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import { Router, useRouter } from 'expo-router';
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { useLayout } from '../context/ApplicationLayoutProvider';
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import CustomStyles from '../utils/styles';
import { CellElement_t } from '../utils/types';
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const MAX_TEMPERATURE: number = 6000

const TemperatureTable: React.FC = React.memo(
    () => {
        const router = useRouter();
        const tailwind = useTailwind();
        const {
            ChangeTextInput, currentTemperature, elements,
            loading, setCurrentTemperature
        } = useTemperatureTable();
        if (loading) {
            return (
                <LoadingBars />
            )
        }

        return (
            <React.Fragment>

                <View style={tailwind("flex-1 flex-col p-2")}>
                    <PeriodicTableFrame contentForInfoBox={RenderInfoBox(tailwind)} elementUIs={GenerateElementUIs(elements, currentTemperature, tailwind, router)} />
                </View>
                <View style={[CustomStyles.shadow,
                tailwind("absolute bottom-2 left-0 right-0 bg-transparent"),]}>
                    <Layout style={tailwind("flex items-center")}>
                        <Controllers ChangeTextInput={ChangeTextInput}
                            currentSliderTemperature={currentTemperature}
                            setCurrentSliderTemperature={setCurrentTemperature}
                            tailwind={tailwind} />
                    </Layout>
                </View>
            </React.Fragment >
        )
    }
)
export default TemperatureTable;

function GenerateElementUIs(elements: CellElement_t[], currentTemperature: number, tailwind: (_classNames: string) => Style, router: Router): React.ReactNode[] {
    return elements.map((element, index) => {
        const elementBg = GetBackgroundColor(element, currentTemperature);
        return (
            <Layout key={index} style={[tailwind(elementBg), { marginVertical: 1, marginHorizontal: 1, width: 100, height: 100 }]}>
                <Pressable onPress={() => router.push(`/detailelement/${element.atomicNumber}`)}>
                    <Text category="h3" style={{ flex: 1, alignContent: "center", textAlign: "center" }}>{element.symbol}</Text>
                    <Text style={tailwind(`text-lg text-center ${elementBg} text-black/100`)}>{element.atomicNumber}</Text>
                </Pressable>

            </Layout>
        )
    })
}

function GetBackgroundColor(element: CellElement_t, currentTemperature: number): string {
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

interface ControllersProps {
    tailwind: (_classNames: string) => Style,
    ChangeTextInput: (v: string) => void,
    currentSliderTemperature: number,
    setCurrentSliderTemperature: React.Dispatch<React.SetStateAction<number>>,

}

const Controllers: React.FC<ControllersProps> =
    ({ ChangeTextInput, currentSliderTemperature, setCurrentSliderTemperature, tailwind }) => {
        return (
            <Layout style={[{ backgroundColor: "#DDDDDDFF" }, tailwind("flex-row rounded-3xl items-center justify-center w-90p p-4")]}>
                <Button style={[tailwind("p-0 mr-3"), { borderColor: "#874F00FF", backgroundColor: "#874F00FF" }]}
                    size="large" onPress={() => setCurrentSliderTemperature(prev => Math.max(0, prev - 1))}>
                    -
                </Button>
                <Slider
                    style={{ width: 700, height: 40 }}
                    value={currentSliderTemperature}
                    onValueChange={(v: number) => setCurrentSliderTemperature(v)}
                    minimumValue={0}
                    maximumValue={MAX_TEMPERATURE}
                    step={1}
                    minimumTrackTintColor="#FF0000FF"
                    maximumTrackTintColor="#0000FFFF"
                    thumbTintColor='#FF0000FF'
                />
                <Button style={[tailwind("p-0 mx-3"), { borderColor: "#874F00FF", backgroundColor: "#874F00FF" }]}
                    size="large" onPress={() => setCurrentSliderTemperature(prev => Math.min(2025, prev + 1))}>
                    +
                </Button>
                <Input
                    style={[tailwind("text-center"), { width: 100 }]}
                    value={currentSliderTemperature.toString()}
                    onChangeText={ChangeTextInput}
                    keyboardType="numeric"
                />
            </Layout>
        )
    }

function useTemperatureTable() {
    const { elements, loading } = usePeriodicTable();

    const [currentTemperature, setCurrentTemperature] = React.useState<number>(0);
    const { lockLandscape } = useLayout();
    const ChangeTextInput = (v: string) => {
        let num = Number(v);
        if (!num) {
            return;
        }
        if (num > MAX_TEMPERATURE) {
            num = MAX_TEMPERATURE;
        }
        if (num < 0) {
            num = 0;
        }
        setCurrentTemperature(num);

    }
    useEffect(() => lockLandscape()
        , [])
    return {
        elements, loading,
        currentTemperature,
        ChangeTextInput,
        setCurrentTemperature,
    }

}