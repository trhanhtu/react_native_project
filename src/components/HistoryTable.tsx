import Slider from '@react-native-community/slider';
import { Input, Layout, Text } from "@ui-kitten/components";
import React from "react";
import { ImageBackground, View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import CustomStyles from '../utils/styles';
import { ViewElement_t } from '../utils/types';
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const HistoryTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const [currentSliderYear, setCurrentSliderYear] = React.useState<number>(0);
        if (loading) {
            return (
                <LoadingBars />
            )
        }

        return (
<ImageBackground 
            source={require('@/assets/images/old_paper_background.jpg')} 
            style={[tailwind("flex-1"), { width: '100%', height: '100%' }]} // Ensure full screen coverage
            resizeMode="cover"
        >
            <View style={tailwind("flex-1 p-2")}> 
                <PeriodicTableFrame
                    elementUIs={GenerateElementUIs(elements, currentSliderYear, tailwind)} 
                />
                <Layout style={[CustomStyles.shadow,tailwind("flex-1 bg-black/50 rounded-3xl flex-row flex-wrap justify-center")]}>
                    <Slider
                        style={{ paddingLeft: 5, width: 600, height: 40 }}
                        value={currentSliderYear}
                        onSlidingComplete={(v: number) => setCurrentSliderYear(v)}
                        minimumValue={0}
                        maximumValue={2025}
                        step={1}
                        minimumTrackTintColor="#FF0000FF"
                        maximumTrackTintColor="#0000FFFF"
                        thumbTintColor='#FF0000FF'
                    />
                    <Input value={currentSliderYear.toString()} />
                </Layout>
            </View>
        </ImageBackground>
        )
    }
)
export default HistoryTable;

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

function GetBackgroundColor(element: ViewElement_t, currentSliderYear: number): string {

    if (element.yearDiscovered <= currentSliderYear){
        
        return "bg-amber-600/100";
    }
    return "bg-amber-100/100";
}