import { Button, Layout } from "@ui-kitten/components";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { useLayout } from "../context/ApplicationLayoutProvider";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import CustomStyles from "../utils/styles";
import { Classification_t, ViewElement_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ButtonText: Classification_t[] = ["-", "kim loại", "phi kim", "trung tính"];

const ClassificationTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const [currentClassification, setCurrentClassification] = React.useState<Classification_t>("-");
        const { lockLandscape } = useLayout();
        useEffect(
            () => {
                lockLandscape();
            }, []
        )
        if (loading) {
            return (
                <LoadingBars />
            )
        }
        const filteredElements: ViewElement_t[] = [];
        elements.forEach(element => {
            if (currentClassification === "-" || element.classification === currentClassification) {
                element.isLightOn = true;
                filteredElements.push(element);
                return;
            }
            element.isLightOn = false;
        })
        return (
            <React.Fragment>

                <View style={tailwind("flex-1 p-2")}>
                    <PeriodicTableFrame elementUIs={GenerateElementUIs(elements, tailwind)} />
                </View>
                <View style={[CustomStyles.shadow,
                tailwind("absolute bottom-2 left-0 right-0 bg-transparent"),]}>

                    <Layout style={tailwind("flex items-center")}>
                        <Controllers tailwind={tailwind} classification={currentClassification} setClassification={setCurrentClassification} />

                    </Layout>
                </View>
            </React.Fragment>
        )
    }
)
export default ClassificationTable;

interface ControllersProps {
    tailwind: (_classNames: string) => Style,
    classification: Classification_t,
    setClassification: React.Dispatch<React.SetStateAction<Classification_t>>,
}

const Controllers: React.FC<ControllersProps> = ({ classification, setClassification, tailwind }) => {

    return (
        <Layout style={[{ backgroundColor: "#DDDDDDFF" }, tailwind("flex-row rounded-3xl items-center justify-center w-90p p-4")]}>

            {ButtonText.map((text, index) => {
                return (
                    <Button disabled={text === classification} status="warning" size="small" key={index} style={tailwind("m-1")} onPress={() => setClassification(text as Classification_t)}>
                        {text}
                    </Button>
                )
            }
            )}

        </Layout>
    )
}