import { useLayout } from "@/src/context/ApplicationLayoutProvider";
import { IndexPath } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useEffect, useReducer } from "react";
import { ViewElement_t } from "../utils/types";


export type HomeState = {
    elements: ViewElement_t[],
    selectedBlockIndex: IndexPath,
    selectedGroupIndex: IndexPath,
    selectedTemperature: number,
    selectedClassificationIndex: IndexPath,
    selectedPeriodIndex: IndexPath,
    isShowImage: boolean,
}
export type HomeAction =
    | { type: "SET_ELEMENTS", payload: ViewElement_t[] }
    | { type: "SET_BLOCK", payload: IndexPath }
    | { type: "CLEAR_FILTER" }
    | { type: "SET_GROUP", payload: IndexPath }
    | { type: "SET_TEMPERATURE", payload: number }
    | { type: "SET_CLASS", payload: IndexPath }
    | { type: "SET_PERIOD", payload: IndexPath }
    | { type: "SET_IS_SHOW_IMAGE", payload: boolean }

// Initial state
const initialState: HomeState = {
    elements: [],
    selectedBlockIndex: new IndexPath(0),
    selectedGroupIndex: new IndexPath(0),
    selectedTemperature: 0,
    selectedClassificationIndex: new IndexPath(0),
    selectedPeriodIndex: new IndexPath(0),
    isShowImage: false,
};

// Reducer function
function homeReducer(state: HomeState, action: HomeAction): HomeState {
    switch (action.type) {
        case "SET_ELEMENTS":
            return { ...state, elements: action.payload };
        case "SET_BLOCK":
            return { ...state, selectedBlockIndex: action.payload };
        case "CLEAR_FILTER":
            return { ...state, selectedBlockIndex: new IndexPath(0), selectedGroupIndex: new IndexPath(0), selectedTemperature: 0, selectedClassificationIndex: new IndexPath(0), selectedPeriodIndex: new IndexPath(0) };
        case "SET_GROUP":
            return { ...state, selectedGroupIndex: action.payload };
        case "SET_TEMPERATURE":
            return { ...state, selectedTemperature: action.payload };
        case "SET_CLASS":
            return { ...state, selectedClassificationIndex: action.payload };
        case "SET_PERIOD":
            return { ...state, selectedPeriodIndex: action.payload };
        case "SET_IS_SHOW_IMAGE":
            return { ...state, isShowImage: action.payload };
        default:
            return state;
    }
}
export default function useHome() {
    const router = useRouter();
    const [homeState, homeDispatch] = useReducer(homeReducer, initialState);
    const { windowDimensions, lockLandscape } = useLayout()
    function handleViewDetail() {
        // router.push("/detail");
    }
    /*useLayoutEffect*/useEffect(() => {
        lockLandscape();
    }, [])

    return {
        homeState,
        homeDispatch,
        handleViewDetail,
        elementWidth: ~~windowDimensions.width / 10,
        elementHeight: ~~windowDimensions.height / 7
    }
}


