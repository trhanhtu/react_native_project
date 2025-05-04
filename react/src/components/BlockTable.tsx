// BlockTable.tsx
import { Icon, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { useTailwind, type Style } from "tailwind-rn";
import { useLayout } from "../context/ApplicationLayoutProvider";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import type { Block_t, CellElement_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

// Dữ liệu block tương tự như phân loại trong ClassificationTable
const BLOCK_DATA = [
    {
        value: "-",
        label: "Tất cả",
        englishLabel: "All Blocks",
        description: "Hiển thị tất cả các block",
        englishDescription: "Display all blocks",
        iconName: "globe-outline",
        color: "#0F172A",
        gradient: ["#0F172A", "#1E293B"],
    },
    {
        value: "s",
        label: "S",
        englishLabel: "S Block",
        description: "Các nguyên tố thuộc block s",
        englishDescription: "Elements in s block",
        iconName: "radio-button-off-outline",
        color: "#3B82F6",
        gradient: ["#3B82F6", "#60A5FA"],
    },
    {
        value: "p",
        label: "P",
        englishLabel: "P Block",
        description: "Các nguyên tố thuộc block p",
        englishDescription: "Elements in p block",
        iconName: "alert-triangle-outline",
        color: "#10B981",
        gradient: ["#10B981", "#34D399"],
    },
    {
        value: "d",
        label: "D",
        englishLabel: "D Block",
        description: "Các nguyên tố thuộc block d",
        englishDescription: "Elements in d block",
        iconName: "square-outline",
        color: "#F59E0B",
        gradient: ["#F59E0B", "#FBBF24"],
    },
    {
        value: "f",
        label: "F",
        englishLabel: "F Block",
        description: "Các nguyên tố thuộc block f",
        englishDescription: "Elements in f block",
        iconName: "info-outline",
        color: "#8B5CF6",
        gradient: ["#8B5CF6", "#A78BFA"],
    },
];

const BlockTable: React.FC = React.memo(() => {
    const { elements, loading } = usePeriodicTable();
    const tailwind = useTailwind();
    const [currentBlock, setCurrentBlock] = useState<Block_t>("-");
    const { lockLandscape } = useLayout();
    const router = useRouter();

    // Animation variables similar to ClassificationTable
    const [fadeAnim] = useState(new Animated.Value(1));
    const [scaleAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        lockLandscape();
    }, []);

    useEffect(() => {
        // Animation sequence khi block thay đổi
        Animated.parallel([
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0.7,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.98,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [currentBlock]);

    if (loading) {
        return <LoadingBars />;
    }

    // Tạo mảng phần tử dựa trên block đã chọn (vẫn thêm cả phần tử tắt sáng để hiển thị dưới dạng mờ)
    const filteredElements: CellElement_t[] = [];
    elements.forEach((element) => {
        if (currentBlock === "-" || element.block === currentBlock) {
            element.isLightOn = true;
        } else {
            element.isLightOn = false;
        }
        filteredElements.push(element);
    });

    // Lấy dữ liệu block hiện tại
    const currentBlockData = BLOCK_DATA.find((b) => b.value === currentBlock);

    // Hàm lấy gradient dựa theo block
    const getBackgroundGradient = (): [string, string] => {
        return currentBlockData?.gradient as [string, string] || ["#0F172A", "#1E293B"];
    };

    return (
        <LinearGradient colors={getBackgroundGradient()} style={tailwind("flex-1")}>
            
            {currentBlock !== "-" && (
                <View style={tailwind("absolute top-4 left-0 right-0 items-center z-1")}>
                    <LinearGradient
                        colors={["rgba(15, 23, 42, 0.9)", "rgba(30, 41, 59, 0.9)"]}
                        style={styles.badgeContainer}
                    >
                        <View style={[styles.colorIndicator, { backgroundColor: currentBlockData?.color || "#94A3B8" }]} />

                        <View style={tailwind("ml-2")}>
                            <Text style={tailwind("text-white/100 text-xl font-bold")}>
                                {currentBlockData?.label}
                            </Text>
                            <Text style={tailwind("text-gray-300/100 text-sm")}>
                                {currentBlockData?.englishLabel}
                            </Text>
                        </View>
                    </LinearGradient>
                </View>
            )}

            
            <Animated.View
                style={[
                    tailwind("flex-1 p-2"),
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                    currentBlock !== "-" && tailwind("pt-16"),
                ]}
            >
                <PeriodicTableFrame elementUIs={GenerateElementUIs(filteredElements, tailwind, router)} />
            </Animated.View>

            
            <View style={tailwind("absolute bottom-2 left-0 right-0")}>
                <BlockSelector currentBlock={currentBlock} setBlock={setCurrentBlock} tailwind={tailwind} />
            </View>
        </LinearGradient>
    );
});

export default BlockTable;

// Component selector tương tự như ClassificationSelector
interface BlockSelectorProps {
    tailwind: (_classNames: string) => Style;
    currentBlock: Block_t;
    setBlock: React.Dispatch<React.SetStateAction<Block_t>>;
}

const BlockSelector: React.FC<BlockSelectorProps> = ({ currentBlock, setBlock, tailwind }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <View style={tailwind("px-2")}>
            <View style={[tailwind("bg-gray-800/100 rounded-xl"), styles.selectorContainer]}>
                <TouchableOpacity
                    onPress={() => setExpanded(!expanded)}
                    style={tailwind("flex-row items-center justify-between px-3 py-2")}
                >
                    <View style={tailwind("flex-row items-center")}>
                        <Text style={tailwind("text-white/100 font-bold mr-2")}>
                            {BLOCK_DATA.find((b) => b.value === currentBlock)?.label || "Tất cả"}
                        </Text>
                        <Text style={tailwind("text-gray-400/100 text-sm")}>
                            {BLOCK_DATA.find((b) => b.value === currentBlock)?.englishLabel || "All Blocks"}
                        </Text>
                        {currentBlock !== "-" && (
                            <View
                                style={[
                                    styles.miniColorIndicator,
                                    {
                                        backgroundColor:
                                            BLOCK_DATA.find((b) => b.value === currentBlock)?.color || "#94A3B8",
                                    },
                                ]}
                            />
                        )}
                    </View>
                    <Icon
                        name={expanded ? "chevron-down-outline" : "chevron-right-outline"}
                        width={20}
                        height={20}
                        fill="#FFFFFF"
                    />
                </TouchableOpacity>

                
                {expanded && (
                    <View style={tailwind("p-2")}>
                        <View style={tailwind("flex-row justify-around")}>
                            {BLOCK_DATA.map((blockItem) => (
                                <TouchableOpacity
                                    key={blockItem.value}
                                    onPress={() => {
                                        setBlock(blockItem.value as Block_t);
                                        setExpanded(false);
                                    }}
                                    style={[
                                        styles.selectorButton,
                                        {
                                            backgroundColor: currentBlock === blockItem.value ? blockItem.color : "#1E293B",
                                            borderColor: currentBlock === blockItem.value ? blockItem.color : "#334155",
                                        },
                                    ]}
                                >
                                    <Icon
                                        name={blockItem.iconName}
                                        width={24}
                                        height={24}
                                        fill={currentBlock === blockItem.value ? "#FFFFFF" : "#94A3B8"}
                                        style={tailwind("mb-1")}
                                    />
                                    <Text
                                        style={[
                                            styles.selectorLabel,
                                            { color: currentBlock === blockItem.value ? "#FFFFFF" : "#94A3B8" },
                                        ]}
                                    >
                                        {blockItem.label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.selectorSubLabel,
                                            { color: currentBlock === blockItem.value ? "#FFFFFF" : "#64748B" },
                                        ]}
                                    >
                                        {blockItem.englishLabel}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <View style={tailwind("mt-2 pt-2 border-t border-gray-700/100")}>
                            <Text style={tailwind("text-gray-400/100 text-xs text-center")}>
                                {BLOCK_DATA.find((b) => b.value === currentBlock)?.description}
                            </Text>
                            <Text style={tailwind("text-gray-500/100 text-xs text-center")}>
                                {BLOCK_DATA.find((b) => b.value === currentBlock)?.englishDescription}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

// Các style được nâng cấp (chú thích bằng tiếng Việt)
const styles = StyleSheet.create({
    badgeContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#475569",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    colorIndicator: {
        width: 12,
        height: 24,
        borderRadius: 6,
    },
    miniColorIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    selectorContainer: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        borderWidth: 1,
        borderColor: "#334155",
    },
    selectorButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#1E293B",
        borderWidth: 1,
        borderColor: "#334155",
        minWidth: 80,
        flex: 1,
        marginHorizontal: 4,
    },
    selectorLabel: {
        fontSize: 14,
        fontWeight: "bold",
    },
    selectorSubLabel: {
        fontSize: 12,
    },
});
