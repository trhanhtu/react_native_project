import { useLayout } from "@/src/context/ApplicationLayoutProvider";
import { useRouter } from "expo-router";
import { useLayoutEffect } from "react";

export default function useHome() {
    const router = useRouter();
    const { windowDimensions, lockLandscape } = useLayout()
    function handleViewDetail() {
        // router.push("/detail");
    }
    useLayoutEffect(() => {
        lockLandscape();
    }, [])
    return {
        handleViewDetail,
        elementWidth: ~~windowDimensions.width / 20,
        elementHeight: ~~windowDimensions.height / 14
    }
}