import ImageTable from "@/src/components/ImageTable";
import LeftSideBar from "@/src/components/LeftSideBar";
import { PeriodicTableProvider } from "@/src/context/PeriodicTableProvider";
import useMain from "@/src/hooks/useMain";
import { TabScreen_t, ViewElement_t } from "@/src/utils/types";
import { Icon, Layout, Text } from "@ui-kitten/components";
import React from "react";
import { useTailwind } from "tailwind-rn";
import ProfileScreen from "./(usertabs)/profile";




export const TABS: TabScreen_t[] = [
    { icon: <Icon name="person-outline" fill="#fff" width={24} height={24} />, name: "Cá nhân", component: <ProfileScreen /> },
    { icon: <Icon name="grid-outline" fill="#fff" width={24} height={24} />, name: "Bảng", component: <ImageTable /> },
    { icon: <Icon name="shake-outline" fill="#fff" width={24} height={24} />, name: "Chu kỳ", component: <Text>Home</Text> },
    { icon: <Icon name="pantone-outline" fill="#fff" width={24} height={24} />, name: "Nhóm", component: <Text>Home</Text> },
    { icon: <Icon name="thermometer-outline" fill="#fff" width={24} height={24} />, name: "Nhiệt độ", component: <Text>Home</Text> },
    { icon: <Icon name="cube-outline" fill="#fff" width={24} height={24} />, name: "phân loại", component: <Text>Home</Text> },
    { icon: <Icon name="layers-outline" fill="#fff" width={24} height={24} />, name: "phân lớp", component: <Text>Home</Text> },
    { icon: <Icon name="headphones-outline" fill="#fff" width={24} height={24} />, name: "podcast", component: <Text>podcast</Text> },
    { icon: <Icon name="file-text-outline" fill="#fff" width={24} height={24} />, name: "chi tiết", component: <Text>podcast</Text> },
];

export default function MainScreen() {
    const tailwind = useTailwind();
    const { tabIndex, setTabIndex } = useMain();
    const mainContent: React.ReactNode =
        tabIndex === 0 ? TABS[0].component
            : <PeriodicTableProvider>
                {TABS[tabIndex].component}
            </PeriodicTableProvider>;
    return (
        <Layout id="main-view" style={tailwind("flex-row bg-white/100 flex-1")}>
            <LeftSideBar tabIndex={tabIndex} setTabIndex={setTabIndex} />
            {mainContent}
        </Layout>
    )
}









function GetBackgroundColor(element: ViewElement_t): string {
    if (!element.isLightOn) {
        return "bg-black/100"
    }
    switch (element.group) {
        case "1":
            if (element.atomicNumber === 1) return "bg-black/100";
            return "bg-custom_pinkBlush/100";
        case "2":
            return "bg-custom_softPink/100";
        case "3":
            if (element.atomicNumber === 57) return "bg-custom_skyAqua/100";
            if (element.atomicNumber === 89) return "bg-custom_limeGreen/100";
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "10":
        case "11":
        case "12":
            return "bg-custom_skyBlue/100";
        case "13":
            return "bg-custom_neonYellow/100";
        case "14":
            return "bg-custom_lavender/100";
        case "15":
            return "bg-custom_silverGray/100";
        case "16":
            return "bg-custom_sunsetOrange/100";
        case "17":
            return "bg-custom_peach/100";
        case "18":
            return "bg-custom_goldenYellow/100";
        default:
            return "bg-white/100";
    }
}