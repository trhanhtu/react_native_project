import BlockTable from "@/src/components/BlockTable";
import ClassificationTable from "@/src/components/ClassificationTable";
import GroupTable from "@/src/components/GroupTable";
import HistoryTable from "@/src/components/HistoryTable";
import ImageTable from "@/src/components/ImageTable";
import PeriodTable from "@/src/components/PeriodTable";
import TemperatureTable from "@/src/components/TemperatureTable";
import { PeriodicTableProvider } from "@/src/context/PeriodicTableProvider";
import { createDrawerNavigator, DrawerNavigationOptions, DrawerNavigationProp } from "@react-navigation/drawer";
import { Icon } from "@ui-kitten/components";
import { useNavigation } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import PodcastScreen from "./podcast";
import ProfileScreen from "./profile";






const Drawer = createDrawerNavigator();
const DrawerLayout = () => (
    <Drawer.Navigator
        screenOptions={{
            headerLeft: () => <HamburgerMenu />,
            headerTitleAlign: "center",
            headerBackgroundContainerStyle: { backgroundColor: "red" },
            

        } as DrawerNavigationOptions}
    >

        <Drawer.Screen name="Cá nhân" component={ProfileScreen} />
        <Drawer.Screen name="Bảng" component={ImageTable} />
        <Drawer.Screen name="Niên đại" component={HistoryTable} />
        <Drawer.Screen name="Chu kỳ" component={PeriodTable} />
        <Drawer.Screen name="Nhóm" component={GroupTable} />
        <Drawer.Screen name="Nhiệt độ" component={TemperatureTable} />
        <Drawer.Screen name="phân loại" component={ClassificationTable} />
        <Drawer.Screen name="phân lớp" component={BlockTable} />
        <Drawer.Screen name="podcast" component={PodcastScreen} />

    </Drawer.Navigator >
);


const HamburgerMenu = () => {
    const navigation = useNavigation<DrawerNavigationProp<{}>>();
    return (
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 15 }}>
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
