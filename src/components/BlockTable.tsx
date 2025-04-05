import { Button, Layout } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { useLayout } from "../context/ApplicationLayoutProvider";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import CustomStyles from "../utils/styles";
import { Block_t, ViewElement_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ButtonText: Block_t[] = ["-", "s", "p", "d", "f"];

const BlockTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const [currentBlock, setCurrentBlock] = React.useState<Block_t>("-");
        const { lockLandscape } = useLayout();
        const router = useRouter();
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
            if (currentBlock === "-" || element.block === currentBlock) {
                element.isLightOn = true;
                filteredElements.push(element);
                return;
            }
            element.isLightOn = false;
        })
        return (
            <React.Fragment>
                <View style={tailwind("flex-1 p-2")}>
                    <PeriodicTableFrame elementUIs={GenerateElementUIs(elements, tailwind, router)} />
                </View>
                <View style={[CustomStyles.shadow,
                tailwind("absolute bottom-2 left-0 right-0 bg-transparent"),]}>

                    <Layout style={tailwind("flex items-center")}>
                        <Controllers tailwind={tailwind} block={currentBlock} setBlock={setCurrentBlock} />

                    </Layout>

                </View>
            </React.Fragment>
        )
    }
)
export default BlockTable;

interface ControllersProps {
    tailwind: (_classNames: string) => Style,
    block: Block_t,
    setBlock: React.Dispatch<React.SetStateAction<Block_t>>,
}

const Controllers: React.FC<ControllersProps> = ({ block, setBlock, tailwind }) => {

    return (
        <Layout style={[{ backgroundColor: "#DDDDDDFF" }, tailwind("flex-row rounded-3xl items-center justify-center w-90p p-4")]}>

            {ButtonText.map((text, index) => {
                return (
                    <Button disabled={text === block} status="warning" size="small" key={index} style={tailwind("m-1")} onPress={() => setBlock(text as Block_t)}>
                        {text}
                    </Button>
                )
            }
            )}

        </Layout>
    )
}