import Slider from "@react-native-community/slider";
import { Button, Input, Layout, Text } from "@ui-kitten/components";
import React, { useEffect } from "react";
import { ImageBackground, View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { useLayout } from '../context/ApplicationLayoutProvider';
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import CustomStyles from '../utils/styles';
import { ViewElement_t } from '../utils/types';
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const CURRENT_YEAR = new Date().getFullYear();

const HistoryTable: React.FC = React.memo(
    () => {
        const tailwind = useTailwind();
        const {
            ChangeTextInput,
            currentSliderYear,
            elements,
            loading,
            setCurrentSliderYear
        } = useHistoryTable();
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
                </View>
                <Layout style={[CustomStyles.shadow,
                tailwind("absolute bottom-2 left-0 right-0 bg-transparent"),]}>
                    <View style={tailwind("flex items-center")}>
                        <Controllers ChangeTextInput={ChangeTextInput}
                            currentSliderYear={currentSliderYear}
                            setCurrentSliderYear={setCurrentSliderYear}
                            tailwind={tailwind} />

                    </View>
                </Layout>
            </ImageBackground>
        );

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

    if (element.yearDiscovered <= currentSliderYear) {

        return "bg-amber-600/100";
    }
    return "bg-amber-100/100";
}

function useHistoryTable() {
    const { elements, loading } = usePeriodicTable();
    const [currentSliderYear, setCurrentSliderYear] = React.useState<number>(0);
    const { lockLandscape } = useLayout();
    const ChangeTextInput = (v: string) => {
        let num = Number(v);
        if (!num) {
            return;
        }
        if (num > CURRENT_YEAR) {
            num = CURRENT_YEAR;
        }
        setCurrentSliderYear(num);

    }
    useEffect(() => lockLandscape()
        , [])
    return {
        elements, loading,
        currentSliderYear,
        ChangeTextInput,
        setCurrentSliderYear,
    }
}

interface ControllersProps {
    tailwind: (_classNames: string) => Style,
    ChangeTextInput: (v: string) => void,
    currentSliderYear: number,
    setCurrentSliderYear: React.Dispatch<React.SetStateAction<number>>,
}

const Controllers: React.FC<ControllersProps> = ({ ChangeTextInput, currentSliderYear, setCurrentSliderYear, tailwind }) => {
    return (
        <Layout style={[{ backgroundColor: "#DDDDDDFF" }, tailwind("flex-row rounded-3xl items-center justify-center w-90p p-4")]}>
            <Button style={[tailwind("p-0"), { borderColor: "#874F00FF", backgroundColor: "#874F00FF" }]}
                size="large" onPress={() => setCurrentSliderYear(prev => Math.max(0, prev - 1))}>
                -
            </Button>
            <Slider
                style={{ flex: 1, maxWidth: 800 }}
                value={currentSliderYear}
                onValueChange={(v: number) => setCurrentSliderYear(v)}
                minimumValue={0}
                maximumValue={2025}
                step={1}
                minimumTrackTintColor="#615858FF"
                maximumTrackTintColor="#615858FF"
                thumbTintColor='#D09D2FFF'
            />
            <Button style={[tailwind("p-0 mr-2"), { borderColor: "#874F00FF", backgroundColor: "#874F00FF" }]}
                size="large" onPress={() => setCurrentSliderYear(prev => Math.min(2025, prev + 1))}>
                +
            </Button>
            <Input
                style={[tailwind("text-center"), { width: 100 }]}
                value={currentSliderYear.toString()}
                onChangeText={ChangeTextInput}
                keyboardType="numeric"
            />
        </Layout>
    )
}
/*



                        {/* Wrapper for centering */
/* <View style={tailwind("flex-row items-center justify-center")}>
    <Button style={tailwind(" items-center justify-center py-7")} size='small' onPress={() => setCurrentSliderYear(prev => Math.max(0, prev - 1))}>
        abv
    </Button>
    <Slider
        style={{ flex: 1, maxWidth: 800 }} // Responsive width
        value={currentSliderYear}
        onSlidingComplete={(v: number) => setCurrentSliderYear(v)}
        minimumValue={0}
        maximumValue={2025}
        step={1}
        minimumTrackTintColor="#FF0000FF"
        maximumTrackTintColor="#0000FFFF"
        thumbTintColor='#D09D2FFF'
    />
    <Button style={tailwind("w-10 h-10 items-center justify-center")} onPress={() => setCurrentSliderYear(prev => Math.min(2025, prev + 1))}>
        +
    </Button>
    <Input
        style={[tailwind("text-center"), { width: 100 }]}
        value={currentSliderYear.toString()}
        onChangeText={ChangeTextInput}
        keyboardType="numeric"
    />
</View> */
