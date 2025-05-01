import { fetchNotificationList } from "@/api/api";
import BlockTable from "@/src/components/BlockTable";
import ClassificationTable from "@/src/components/ClassificationTable";
import GroupTable from "@/src/components/GroupTable";
import HistoryTable from "@/src/components/HistoryTable";
import ImageTable from "@/src/components/ImageTable";
import PeriodTable from "@/src/components/PeriodTable";
import PodcastTable from "@/src/components/PodcastTable";
import TemperatureTable from "@/src/components/TemperatureTable";
import UnreadNotificationIcon from "@/src/components/UnreadNotificationIcon";
import { useLayout } from "@/src/context/ApplicationLayoutProvider";
import { PeriodicTableProvider } from "@/src/context/PeriodicTableProvider";
import { NotificationsResponse } from "@/src/utils/types";
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
    { name: "Trang chủ", component: HomeScreen, isPortrait: true, drawerIconFunc: undefined, isLazy: true },
    { name: "Thông báo", component: NotificationsScreen, isPortrait: true, drawerIconFunc: UnreadNotificationIcon, isLazy: false },
    { name: "Cá nhân", component: ProfileScreen, isPortrait: true, drawerIconFunc: undefined, isLazy: true },
    { name: "Tìm kiếm", component: GlobalSearchScreen, isPortrait: true, drawerIconFunc: undefined, isLazy: true },
    { name: "Bảng", component: ImageTable, isPortrait: false, drawerIconFunc: undefined, isLazy: true },
    { name: "Niên đại", component: HistoryTable, isPortrait: false, drawerIconFunc: undefined, isLazy: true },
    { name: "Chu kỳ", component: PeriodTable, isPortrait: false, drawerIconFunc: undefined, isLazy: true },
    { name: "Nhóm", component: GroupTable, isPortrait: false, drawerIconFunc: undefined, isLazy: true },
    { name: "Nhiệt độ", component: TemperatureTable, isPortrait: false, drawerIconFunc: undefined, isLazy: true },
    { name: "Phân loại", component: ClassificationTable, isPortrait: false, drawerIconFunc: undefined, isLazy: true },
    { name: "Phân lớp", component: BlockTable, isPortrait: false, drawerIconFunc: undefined, isLazy: true },
    { name: "Podcast", component: PodcastTable, isPortrait: false, drawerIconFunc: undefined, isLazy: true },
];

const DrawerLayout = () => {
    const { lockLandscape, lockPortrait } = useLayout();
    useEffect(() => {
        // Initialize notification system when the app starts
        // initializeNotificationSystem()
        fetchNotificationList().then((res: NotificationsResponse) => {
            if (res && res.result) {
                // Handle the fetched notifications here
                console.log("Fetched notifications:", res.result);
            } else {
                console.error("Failed to fetch notifications or no data available.");
            }
        });
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
            {screens.map(({ name, component, isPortrait, drawerIconFunc, isLazy }) => (
                <Drawer.Screen
                    key={name}
                    name={name}
                    component={component}
                    listeners={getScreenListeners(isPortrait)}
                    options={{
                        lazy: isLazy,
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
