import { Button, Layout } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import { Block_t, ViewElement_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ButtonText: Block_t[] = ["-", "s", "p", "d", "f"];

const BlockTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const [currentBlock, setCurrentBlock] = React.useState<Block_t>("-");
        if (loading) {
            return (
                <LoadingBars />
            )
        }
        const filteredElements: ViewElement_t[] = [];
        elements.forEach(element => {
            if (currentBlock === "-" || element.block === currentBlock) {
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
                            <Button disabled={text === currentBlock} status="warning" size="small" key={index} style={tailwind("m-1")} onPress={() => setCurrentBlock(text as Block_t)}>
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
export default BlockTable;