import { useLayout } from "@/src/context/ApplicationLayoutProvider";
import { IndexPath } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useReducer } from "react";
import GetRandomBetween from "../utils/random";
import { Block_t, Classification_t, Group_t, HomeElement_t, Period_t } from "../utils/types";


export type HomeState = {
    elements: HomeElement_t[],
    selectedBlockIndex: IndexPath,
    selectedGroupIndex: IndexPath,
    selectedTemperature: number,
    selectedClassificationIndex: IndexPath,
    selectedPeriodIndex: IndexPath,
    isShowImage: boolean,
}
export type HomeAction =
    | { type: "SET_ELEMENTS", payload: HomeElement_t[] }
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
    useLayoutEffect(() => {
        lockLandscape();
    }, [])
    useEffect(() => {
        const elements: HomeElement_t[] = GenerateDummy();
        homeDispatch({ type: "SET_ELEMENTS", payload: elements })
    }, [])
    return {
        homeState,
        homeDispatch,
        handleViewDetail,
        elementWidth: ~~windowDimensions.width / 10,
        elementHeight: ~~windowDimensions.height / 7
    }
}

function GenerateDummy(): HomeElement_t[] {
    return Array.from({ length: 118 }, (_, index) => {
        const _meltingPoint = Math.random() * 6001
        const _boilingPoint = Math.random() * 6001 + _meltingPoint;
        return {
            symbol: GenerateSymbol(),
            atomicNumber: index + 1,
            block: GenerateBlock(),
            group: GenerateGroup(),
            period: GeneratePeriod(),
            meltingPoint: ~~_meltingPoint,
            boilingPoint: ~~_boilingPoint,
            classification: GenerateClass(),
            isLightOn: true,

        } as HomeElement_t;
    })
}
function GenerateBlock(): Block_t {
    switch (GetRandomBetween(1, 4)) {
        case 1:
            return "s"
        case 2:
            return "p"
        case 3:
            return "d"
        case 4:
            return "f"
        default:
            return "-";
    }
}

function GenerateGroup(): Group_t {
    return GetRandomBetween(1, 18).toString() as Group_t;
}

function GenerateClass(): Classification_t {
    switch (GetRandomBetween(1, 3)) {
        case 1:
            return "kim loại";
        case 2:
            return "phi kim";
        case 3:
            return "trung tính";
        default:
            return "-";
    }
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function GenerateSymbol(): string {
    return Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function GeneratePeriod(): import("../utils/types").Period_t {
    const value = GetRandomBetween(1, 9);
    if (value === 9) return "lan";
    if (value === 8) return "act";
    return value.toString() as Period_t;
}

