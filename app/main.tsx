import BlockTable from "@/src/components/BlockTable";
import ClassificationTable from "@/src/components/ClassificationTable";
import GroupTable from "@/src/components/GroupTable";
import HistoryTable from "@/src/components/HistoryTable";
import ImageTable from "@/src/components/ImageTable";
import PeriodTable from "@/src/components/PeriodTable";
import PodcastTable from "@/src/components/PodcastTable";
import TemperatureTable from "@/src/components/TemperatureTable";
import UnreadNotificationIcon, { initializeNotificationSystem } from "@/src/components/UnreadNotificationIcon";
import { useLayout } from "@/src/context/ApplicationLayoutProvider";
import { PeriodicTableProvider } from "@/src/context/PeriodicTableProvider";
import { createDrawerNavigator, DrawerNavigationOptions, DrawerNavigationProp } from "@react-navigation/drawer";
import { Icon } from "@ui-kitten/components";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import HomeScreen from "./home";
import NotificationsScreen from "./notification";
import ProfileScreen from "./profile";
import GlobalSearchScreen from "./search";






const Drawer = createDrawerNavigator();
const screens = [
    { name: "Trang chủ", component: HomeScreen, isPortrait: true, drawerIconFunc: undefined },
    { name: "Thông báo", component: NotificationsScreen, isPortrait: true, drawerIconFunc: UnreadNotificationIcon },
    { name: "Cá nhân", component: ProfileScreen, isPortrait: true, drawerIconFunc: undefined },
    { name: "Tìm kiếm", component: GlobalSearchScreen, isPortrait: true, drawerIconFunc: undefined },
    { name: "Bảng", component: ImageTable, isPortrait: false, drawerIconFunc: undefined },
    { name: "Niên đại", component: HistoryTable, isPortrait: false, drawerIconFunc: undefined },
    { name: "Chu kỳ", component: PeriodTable, isPortrait: false, drawerIconFunc: undefined },
    { name: "Nhóm", component: GroupTable, isPortrait: false, drawerIconFunc: undefined },
    { name: "Nhiệt độ", component: TemperatureTable, isPortrait: false, drawerIconFunc: undefined },
    { name: "phân loại", component: ClassificationTable, isPortrait: false, drawerIconFunc: undefined },
    { name: "phân lớp", component: BlockTable, isPortrait: false, drawerIconFunc: undefined },
    { name: "podcast", component: PodcastTable, isPortrait: false, drawerIconFunc: undefined },
];

const DrawerLayout = () => {
    const { lockLandscape, lockPortrait } = useLayout();
    useEffect(() => {
        // Initialize notification system when the app starts
        initializeNotificationSystem()
    }, [])
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
            {screens.map(({ name, component, isPortrait, drawerIconFunc }) => (
                <Drawer.Screen
                    key={name}
                    name={name}
                    component={component}
                    listeners={getScreenListeners(isPortrait)}
                    options={{
                        lazy: true,
                        drawerIcon: drawerIconFunc
                    } as DrawerNavigationOptions}
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
