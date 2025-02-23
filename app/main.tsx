import LeftSideBar from "@/src/components/LeftSideBar";
import { PeriodicTableProvider } from "@/src/context/PeriodicTableProvider";
import useMain from "@/src/hooks/useMain";
import TABS from "@/src/TabList";
import { Layout } from "@ui-kitten/components";
import React from "react";
import { useTailwind } from "tailwind-rn";





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
