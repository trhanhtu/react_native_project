import useHome, { HomeAction, HomeState } from "@/src/hooks/useHome";
import { Block_t, Classification_t, Group_t, HomeElement_t, Period_t } from "@/src/utils/types";
import Slider from '@react-native-community/slider';
import { Button, IndexPath, Layout, Select, SelectItem, Text } from "@ui-kitten/components";
import React, { Dispatch, ReactNode, useState } from "react";
import { ScrollView, View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";

export default function HomeScreen() {
    const tailwind = useTailwind();
    const {
        homeState,
        homeDispatch,
        elementHeight,
        elementWidth,
    } = useHome()

    return (
        <Layout style={tailwind("flex-1 bg-green-200/100 items-center")}>
            <PeriodicTableFrame spaceHeight={elementHeight} tailwind={tailwind} elementUIs={GenerateElementUIs(homeState, tailwind, elementHeight, elementWidth)} />
            <Controller tailwind={tailwind} homeState={homeState} homeDispath={homeDispatch} />
        </Layout>
    )
}

interface PeriodicTableFrameProps {
    spaceHeight: number,
    tailwind: (_classNames: string) => Style,
    elementUIs: React.ReactNode[],
}

const PeriodicTableFrame: React.FC<PeriodicTableFrameProps> =
    ({ spaceHeight, elementUIs, tailwind }) => {
        return (
            <ScrollView
                horizontal
                nestedScrollEnabled={true}
                style={tailwind("bg-white/100 h-60p flex mb-2")}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                    nestedScrollEnabled={true}
                    style={{ height: '100%' }}>
                    <View id="row_0_to_2" style={tailwind("flex flex-row")}>
                        {RenderElementNo1To12(elementUIs, tailwind)}
                        {RenderInfoBox(elementUIs, tailwind)}
                        {RenderElementNo2To13AndSupplyRiskBox(elementUIs, tailwind)}
                    </View>

                    <View id="row_3_to_6">
                        <Layout id="row_3" style={tailwind("flex flex-row justify-between")}>
                            {elementUIs.slice(18, 36)}
                        </Layout>
                        <Layout id="row_4" style={tailwind("flex flex-row justify-between")}>
                            {elementUIs.slice(36, 54)}
                        </Layout>
                        <Layout id="row_5" style={tailwind("flex flex-row justify-between")}>
                            {[elementUIs[54], elementUIs[55], elementUIs.slice(70, 86)]}
                        </Layout>
                        <Layout id="row_6" style={tailwind("flex flex-row justify-between")}>
                            {[elementUIs[86], elementUIs[87], ...elementUIs.slice(102, 118)]}
                        </Layout>
                    </View>

                    <View id="row_7_to_8">
                        <Layout id="row_7" style={tailwind("flex flex-row justify-center")}>
                            {elementUIs.slice(56, 70)}
                        </Layout>
                        <Layout id="row_8" style={tailwind("flex flex-row justify-center")}>
                            {elementUIs.slice(88, 102)}
                        </Layout>
                    </View>
                </ScrollView>
            </ScrollView>
        );
    };


// -----------------------------------------------------------------------------------------------------
const Controller: React.FC<{ tailwind: (_classNames: string) => Style, homeState: HomeState, homeDispath: Dispatch<HomeAction> }> = React.memo(
    ({ tailwind, homeState, homeDispath }) => {
        return (
            <View style={tailwind("flex-1 w-full bg-white/100 p-1")}>
                {RenderFirstRowController(tailwind, homeState, homeDispath)}
                {RenderSecondRowController(tailwind, homeDispath)}
            </View>
        )
    }
)
// -----------------------------------------------------------------------------------------------------
const TemperatureSlider: React.FC<{ tailwind: (_classNames: string) => Style }> = ({ tailwind }) => {
    const [temperature, setTemperature] = useState<number>(0);


    const handleValueChange = (value: number) => {
        setTemperature(value);

    };

    return (
        <Layout style={tailwind('flex flex-row items-center')}>
            <Text>{temperature.toLocaleString()} K</Text>
            <Slider
                style={{ paddingLeft: 5, width: 600, height: 40 }}
                value={temperature}
                onSlidingComplete={handleValueChange}
                minimumValue={0}
                maximumValue={6000}
                step={1}
                minimumTrackTintColor="#FF0000FF"
                maximumTrackTintColor="#000000FF"
            />
        </Layout>
    );
};

const GROUP_VALUES: Group_t[] = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"]
// -----------------------------------------------------------------------------------------------------
const GroupSelect: React.FC<{ tailwind: (_classNames: string) => Style, selectedGroupIndex: IndexPath, homeDispath: Dispatch<HomeAction> }> = ({ tailwind, selectedGroupIndex, homeDispath }) => {

    const selectedGroup = GROUP_VALUES[selectedGroupIndex.row];
    return (
        <Select
            size="small"
            status="danger"
            selectedIndex={selectedGroupIndex}
            style={{ width: 100 }}
            onSelect={index => homeDispath({ type: "SET_GROUP", payload: index as IndexPath })}
            value={selectedGroup}
        >
            {GROUP_VALUES.map((v) => <SelectItem key={v} title={v} />)}
        </Select>
    );
}
// -----------------------------------------------------------------------------------------------------
const CLASSIFICATION_VALUES: Classification_t[] = ["-", "kim loại", "phi kim", "trung tính"];
const ClassificationSelect: React.FC<{ tailwind: (_classNames: string) => Style, selectedClassificationIndex: IndexPath, homeDispath: Dispatch<HomeAction> }> = ({ tailwind, selectedClassificationIndex, homeDispath }) => {

    const displayValue = CLASSIFICATION_VALUES[selectedClassificationIndex.row];
    return (
        <Select
            size="small"
            status="info"
            selectedIndex={selectedClassificationIndex}
            style={{ width: 140 }}
            onSelect={index => homeDispath({ type: "SET_CLASS", payload: index as IndexPath })}
            value={displayValue}
        >
            {CLASSIFICATION_VALUES.map((v) => <SelectItem key={v} title={v} />)}
        </Select>
    );
}
// -----------------------------------------------------------------------------------------------------
const BLOCK_VALUES: Block_t[] = ["-", "s", "p", "d", "f"]
const BlockSelect: React.FC<{ tailwind: (_classNames: string) => Style, selectedBlockIndex: IndexPath, homeDispath: Dispatch<HomeAction> }> = ({ tailwind, selectedBlockIndex, homeDispath }) => {

    const displayValue = BLOCK_VALUES[selectedBlockIndex.row];
    return (
        <Select
            size="small"
            status="success"
            selectedIndex={selectedBlockIndex}
            style={{ width: 90 }}
            onSelect={index => homeDispath({ type: "SET_BLOCK", payload: index as IndexPath })}
            value={displayValue}
        >
            {BLOCK_VALUES.map((v) => <SelectItem key={v} title={v} />)}
        </Select>
    );
};
// -----------------------------------------------------------------------------------------------------
const PERIOD_VALUES: Period_t[] = ["-", "1", "2", "3", "4", "5", "6", "7", "lan", "act"]
const PeriodSelect: React.FC<{ tailwind: (_classNames: string) => Style, selectedPeriodIndex: IndexPath, homeDispath: Dispatch<HomeAction> }> = ({ tailwind, selectedPeriodIndex, homeDispath }) => {

    const displayValue = PERIOD_VALUES[selectedPeriodIndex.row];
    return (
        <Select
            size="small"
            status="warning"
            selectedIndex={selectedPeriodIndex}
            style={{ width: 100 }}
            onSelect={index => homeDispath({ type: "SET_PERIOD", payload: index as IndexPath })}
            value={displayValue}
        >
            {PERIOD_VALUES.map((v) => <SelectItem key={v} title={v} />)}
        </Select>
    );
};


// -----------------------------------------------------------------------------------------------------
function GenerateElementUIs({ elements, isShowImage, selectedBlockIndex, selectedClassificationIndex, selectedGroupIndex, selectedPeriodIndex, selectedTemperature }: HomeState,
    tailwind: (_classNames: string) => Style,
    elementHeight: number,
    elementWidth: number): React.ReactNode[] {
    let filterdElements = [...elements];


    filterdElements = filterdElements.map((element) => {
        element.isLightOn =
            (selectedGroupIndex.row === 0 || element.group === GROUP_VALUES[selectedGroupIndex.row]) &&
            (selectedBlockIndex.row === 0 || element.block === BLOCK_VALUES[selectedBlockIndex.row]) &&
            (selectedPeriodIndex.row === 0 || element.period === PERIOD_VALUES[selectedPeriodIndex.row]) &&
            (selectedClassificationIndex.row === 0 || element.classification === CLASSIFICATION_VALUES[selectedClassificationIndex.row]);
        return element;
    });

    // if (selectedBlockIndex.row !== 0) {
    //     filterdElements = filterdElements.map((element) => element.block === BLOCK_VALUES[selectedBlockIndex.row]);
    // }
    // if (selectedClassificationIndex.row !== 0) {
    //     filterdElements = filterdElements.map((element) => element.classification === CLASSIFICATION_VALUES[selectedClassificationIndex.row]);
    // }
    // if (selectedPeriodIndex.row !== 0) {
    //     filterdElements = filterdElements.map((element) => element.period === PERIOD_VALUES[selectedPeriodIndex.row]);
    // }

    return filterdElements.map((element, index) => {


        return (
            <Layout key={index} style={[tailwind(GetBackgroundColor(element)), { marginVertical: 1, marginHorizontal: 1, width: elementWidth, height: elementHeight }]}>
                <Text style={tailwind("text-right pr-1")}>{element.atomicNumber}</Text>
                <Text category="h3" style={{ flex: 1, alignContent: "center", textAlign: "center" }}>{element.symbol}</Text>
            </Layout>
        )
    }
    )
}

function RenderFirstRowController(tailwind: (_classNames: string) => Style, homeState: HomeState, homeDispath: Dispatch<HomeAction>) {
    const { isShowImage, selectedBlockIndex, selectedClassificationIndex, selectedGroupIndex, selectedPeriodIndex, selectedTemperature
    } = homeState;
    return (
        <Layout style={tailwind("flex-1 flex-row flex-wrap justify-around")}>
            <Button size="small" appearance="ghost" style={tailwind("p-0")} status="info">Ảnh</Button>
            <GroupSelect tailwind={tailwind} selectedGroupIndex={selectedGroupIndex} homeDispath={homeDispath} />
            <ClassificationSelect tailwind={tailwind} selectedClassificationIndex={selectedClassificationIndex} homeDispath={homeDispath} />
            <BlockSelect tailwind={tailwind} selectedBlockIndex={selectedBlockIndex} homeDispath={homeDispath} />
            <PeriodSelect tailwind={tailwind} selectedPeriodIndex={selectedPeriodIndex} homeDispath={homeDispath} />
            <Button size="small" appearance="ghost" style={tailwind("p-0")} status="danger" onPress={() => homeDispath({ type: "CLEAR_FILTER" })}>Xóa Lọc</Button>
        </Layout>
    )
}
function RenderSecondRowController(tailwind: (_classNames: string) => Style, homeDispath: Dispatch<HomeAction>) {
    return (
        <Layout style={tailwind("flex flex-row justify-center items-center bg-white/100")}>
            <TemperatureSlider tailwind={tailwind} />

        </Layout>
    )
}

function RenderElementNo2To13AndSupplyRiskBox(elementUIs: ReactNode[], tailwind: (_classNames: string) => Style): ReactNode {
    return (
        <View>
            <Layout id="row_1" style={tailwind("flex flex-row")} >
                <View id="supply box" style={tailwind("flex-1 bg-amber-400/100")}>
                    <Text>Supply box</Text>
                </View>
                {elementUIs[2]}
            </Layout>
            <Layout id="row_2" style={tailwind("flex flex-row")}>
                {elementUIs.slice(4, 10)}
            </Layout>
            <Layout id="row_3" style={tailwind("flex flex-row")}>
                {elementUIs.slice(12, 18)}
            </Layout>
        </View>
    )
}

function RenderInfoBox(elementUIs: ReactNode[], tailwind: (_classNames: string) => Style): ReactNode {
    return (
        <View style={tailwind("flex-1 bg-lime-600/100")}>
            <Text>xcvbn</Text>
        </View>
    )
}

function RenderElementNo1To12(elementUIs: ReactNode[], tailwind: (_classNames: string) => Style): ReactNode {
    return (
        <View>
            {elementUIs[0]}
            <Layout style={tailwind("flex flex-row")}>
                {elementUIs[2]}
                {elementUIs[3]}
            </Layout>
            <Layout style={tailwind("flex flex-row")}>
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

function GetBackgroundColor(element: HomeElement_t): string {
    if (!element.isLightOn) {
        return "bg-black/100"
    }
    switch (element.group) {
        case "1":
            if (element.atomicNumber === 1) return "bg-black/100";
            return "bg-custom_pinkBlush/100";
        case "2":
            return "bg-custom_softPink/100";
        case "3":
            if (element.atomicNumber === 57) return "bg-custom_skyAqua/100";
            if (element.atomicNumber === 89) return "bg-custom_limeGreen/100";
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "10":
        case "11":
        case "12":
            return "bg-custom_skyBlue/100";
        case "13":
            return "bg-custom_neonYellow/100";
        case "14":
            return "bg-custom_lavender/100";
        case "15":
            return "bg-custom_silverGray/100";
        case "16":
            return "bg-custom_sunsetOrange/100";
        case "17":
            return "bg-custom_peach/100";
        case "18":
            return "bg-custom_goldenYellow/100";
        default:
            return "bg-white/100";
    }
}