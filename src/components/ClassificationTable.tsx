import { Button, Layout } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import { Classification_t, ViewElement_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ButtonText: Classification_t[] = ["-", "kim loại", "phi kim", "trung tính"];

const ClassificationTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const [currentClassification, setCurrentClassification] = React.useState<Classification_t>("-");
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
            <View style={tailwind("flex-1 flex-col p-2")}>
                <PeriodicTableFrame elementUIs={GenerateElementUIs(elements, tailwind)} />
                <Layout style={tailwind("flex-1 bg-gray-400/100 rounded-3xl shadow-2xl flex-row flex-wrap px-5p")}>
        

                        {ButtonText.map((text, index) => {
                            return (
                                <Button disabled={text === currentClassification} status="warning" size="small" key={index} style={tailwind("flex-1")} onPress={() => setCurrentClassification(text as Classification_t)}>
                                    {text}
                                </Button>
                            )
                        }
                        )}
             
                </Layout>
            </View>
        )
    }
)
export default ClassificationTable;