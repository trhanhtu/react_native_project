import { Button, Layout } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import { Period_t, ViewElement_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ButtonText: Period_t[] = ["-", "1", "2", "3", "4", "5", "6", "7", "lan", "act"];

const PeriodTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const [period, setPeriod] = React.useState<Period_t>("-");
        if (loading) {
            return (
                <LoadingBars />
            )
        }
        const filteredElements: ViewElement_t[] = [];
        elements.forEach(element => {
            if (period === "-" || element.period === period) {
                element.isLightOn = true;
                filteredElements.push(element);
                return;
            }
            element.isLightOn = false;
        })
        return (
            <View style={tailwind("flex-1 flex-col p-2")}>
                <PeriodicTableFrame elementUIs={GenerateElementUIs(elements, tailwind)} />
                <Layout style={tailwind("flex-1 bg-gray-400/100 rounded-3xl shadow-2xl flex-row justify-center")}>
                    {ButtonText.map((text, index) => {
                        return (
                            <Button disabled={text === period} status="warning" size="small" key={index} style={tailwind("m-1")} onPress={() => setPeriod(text as Period_t)}>
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
export default PeriodTable;