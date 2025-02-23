import { Button, Layout } from "@ui-kitten/components";
import React from "react";
import { ScrollView, View } from "react-native";
import { useTailwind } from "tailwind-rn";
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
            <View style={tailwind("flex-1 flex-col p-2")}>
                <PeriodicTableFrame elementUIs={GenerateElementUIs(elements, tailwind)} />
                <Layout style={[CustomStyles.shadow, tailwind("flex-1 bg-gray-400/100 rounded-3xl flex-row flex-wrap justify-center")]}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={tailwind("flex-1 mx-5p")}>

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
            </View>
        )
    }
)
export default GroupTable;