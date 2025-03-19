import { Button, Layout } from "@ui-kitten/components";
import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { useLayout } from "../context/ApplicationLayoutProvider";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import CustomStyles from "../utils/styles";
import { Group_t, ViewElement_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ButtonText: Group_t[] = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "lan", "act"];

const GroupTable: React.FC = React.memo(
    () => {
        const { elements, loading } = usePeriodicTable();
        const tailwind = useTailwind();
        const [group, setGroup] = React.useState<Group_t>("-");
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
            if (group === "-" || element.group === group) {
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
                        <Controllers tailwind={tailwind} group={group} setGroup={setGroup} />

                    </Layout>

                </View>
            </React.Fragment>

        )
    }
)
export default GroupTable;

interface ControllersProps {
    tailwind: (_classNames: string) => Style,
    group: Group_t,
    setGroup: React.Dispatch<React.SetStateAction<Group_t>>,
}

const Controllers: React.FC<ControllersProps> = ({ group, setGroup, tailwind }) => {

    return (
        <Layout style={[{ backgroundColor: "#DDDDDDFF" }, tailwind("flex-row rounded-3xl items-center justify-center w-90p p-4")]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                {ButtonText.map((text, index) => {
                    return (
                        <Button disabled={text === group} status="warning" size="small" key={index} style={tailwind("m-1")} onPress={() => setGroup(text as Group_t)}>
                            {text}
                        </Button>
                    )
                }
                )}
            </ScrollView>
        </Layout>
    )
}