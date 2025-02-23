import TABS from "@/src/TabList";
import { Text } from "@ui-kitten/components";
import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTailwind } from "tailwind-rn";

interface LeftSideBarProps {
    tabIndex: number;
    setTabIndex: React.Dispatch<React.SetStateAction<number>>
}




const LeftSideBar: React.FC<LeftSideBarProps> = React.memo(
    ({ tabIndex, setTabIndex }) => {
        const tailwind = useTailwind();
        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                id="left-side-bar"
                style={tailwind("max-w-10p h-full bg-blue-500/100")}>
                {TABS.map((tab, index) => (
                    <TouchableOpacity
                        key={tab.name}
                        style={[
                            tailwind("p-3 rounded-lg flex items-center justify-center mb-2"),
                            tabIndex === index ? tailwind("bg-gray-700/100") : {}
                        ]}
                        onPress={() => setTabIndex(index)}
                    >
                        {tab.icon}
                        <Text style={tailwind("text-white/100 text-xs mt-1")}>{tab.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        )
    }
)

export default LeftSideBar;