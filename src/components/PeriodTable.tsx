import { Button, Layout } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { useLayout } from "../context/ApplicationLayoutProvider";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import CustomStyles from "../utils/styles";
import { CellElement_t, Period_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const ButtonText: Period_t[] = ["-", "1", "2", "3", "4", "5", "6", "7", "lan", "act"];

const PeriodTable: React.FC = React.memo(
  () => {
    const { elements, loading } = usePeriodicTable();
    const tailwind = useTailwind();
    const [period, setPeriod] = React.useState<Period_t>("-");
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
    const filteredElements: CellElement_t[] = [];
    elements.forEach(element => {
      if (period === "-" || element.period === period) {
        element.isLightOn = true;
        filteredElements.push(element);
        return;
      }
      element.isLightOn = false;
    })
    return (
      <React.Fragment>

        <View style={tailwind("flex-1 p-2")}>
          <PeriodicTableFrame
            elementUIs={GenerateElementUIs(elements, tailwind,router)}
          />
        </View>
        <Layout style={[CustomStyles.shadow,
        tailwind("absolute bottom-2 left-0 right-0 bg-transparent"),]}>
          <View style={tailwind("flex items-center")}>
            <Controllers tailwind={tailwind} period={period} setPeriod={setPeriod} />

          </View>
        </Layout>
      </ React.Fragment>


    );
  });
export default PeriodTable;

interface ControllersProps {
  tailwind: (_classNames: string) => Style,
  period: Period_t,
  setPeriod: React.Dispatch<React.SetStateAction<Period_t>>,
}

const Controllers: React.FC<ControllersProps> = ({ period, setPeriod, tailwind }) => {

  return (
    <Layout style={[{ backgroundColor: "#DDDDDDFF" }, tailwind("flex-row rounded-3xl items-center justify-center w-90p p-4")]}>
      {ButtonText.map((text, index) => {
        return (
          <Button disabled={text === period} status="warning" size="small" key={index} style={tailwind("m-1")} onPress={() => setPeriod(text as Period_t)}>
            {text}
          </Button>
        )
      }
      )}
    </Layout>
  )
}