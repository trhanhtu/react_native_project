import { /*useLayoutEffect*/ useEffect, useState } from "react";
import { useLayout } from "../context/ApplicationLayoutProvider";

export default function useMain() {
    const { windowDimensions, lockLandscape, lockPortrait } = useLayout();
    const [tabIndex, setTabIndex] = useState<number>(0);
    /*useLayoutEffect*/useEffect(() => {
        lockLandscape();
        return () => {
            lockPortrait();
        }
    }, [])
    return {
        tabIndex,
        setTabIndex
    }
}