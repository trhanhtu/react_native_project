import BlockTable from "@/src/components/BlockTable";
import ClassificationTable from "@/src/components/ClassificationTable";
import GroupTable from "@/src/components/GroupTable";
import HistoryTable from "@/src/components/HistoryTable";
import ImageTable from "@/src/components/ImageTable";
import PeriodTable from "@/src/components/PeriodTable";
import TemperatureTable from "@/src/components/TemperatureTable";
import { useLayout } from "@/src/context/ApplicationLayoutProvider";
import { PeriodicTableProvider } from "@/src/context/PeriodicTableProvider";
import { createDrawerNavigator, DrawerNavigationOptions, DrawerNavigationProp } from "@react-navigation/drawer";
import { Icon } from "@ui-kitten/components";
import { useNavigation } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import PodcastScreen from "./podcast";
import ProfileScreen from "./profile";






const Drawer = createDrawerNavigator();
const screens = [
    { name: "Cá nhân", component: ProfileScreen, isPortrait: true },
    { name: "Bảng", component: ImageTable, isPortrait: false },
    { name: "Niên đại", component: HistoryTable, isPortrait: false },
    { name: "Chu kỳ", component: PeriodTable, isPortrait: false },
    { name: "Nhóm", component: GroupTable, isPortrait: false },
    { name: "Nhiệt độ", component: TemperatureTable, isPortrait: false },
    { name: "phân loại", component: ClassificationTable, isPortrait: false },
    { name: "phân lớp", component: BlockTable, isPortrait: false },
    { name: "podcast", component: PodcastScreen, isPortrait: true },
];

const DrawerLayout = () => {
    const { lockLandscape, lockPortrait } = useLayout();

    const getScreenListeners = (isPortrait: boolean) => ({
        focus: () => (isPortrait ? lockPortrait() : lockLandscape()),
    });

    return (
        <Drawer.Navigator
            screenOptions={{
                headerLeft: () => <HamburgerMenu />,
                headerTitleAlign: "center",
                headerBackgroundContainerStyle: { backgroundColor: "red" },
            } as DrawerNavigationOptions}
        >
            {screens.map(({ name, component, isPortrait }) => (
                <Drawer.Screen
                    key={name}
                    name={name}
                    component={component}
                    listeners={getScreenListeners(isPortrait)}
                />
            ))}
        </Drawer.Navigator>
    );
};


const HamburgerMenu = () => {
    const navigation = useNavigation<DrawerNavigationProp<{}>>();
    return (
        <TouchableOpacity onPress={() => { navigation.openDrawer() }} style={{ marginLeft: 15 }}>
            <Icon name="menu-outline" fill="black" style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
    );
};


export default function MainScreen() {
    return (
        <PeriodicTableProvider>
            <DrawerLayout />
        </PeriodicTableProvider>
    )
}
