"use client"

import { Icon, Text } from "@ui-kitten/components"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native"
import { type Style, useTailwind } from "tailwind-rn"
import { useLayout } from "../context/ApplicationLayoutProvider"
import { usePeriodicTable } from "../context/PeriodicTableProvider"
import GenerateElementUIs from "../utils/GenerateArrayElementUI"
import type { CellElement_t, Classification_t } from "../utils/types"
import LoadingBars from "./LoadingBars"
import PeriodicTableFrame from "./PeriodicTableFrame"

// Classification data with descriptive names, properties and translations
// Using only icon names that are definitely available in UI Kitten
const CLASSIFICATION_DATA = [
    {
        value: "-",
        label: "Tất cả",
        englishLabel: "All Elements",
        description: "Hiển thị tất cả các nguyên tố",
        englishDescription: "Display all elements",
        iconName: "globe-outline", // Changed to a standard UI Kitten icon
        color: "#3B82F6",
    },
    {
        value: "kim loại",
        label: "Kim loại",
        englishLabel: "Metals",
        description: "Các nguyên tố kim loại",
        englishDescription: "Metallic elements",
        iconName: "square-outline", // Changed to a standard UI Kitten icon
        color: "#F59E0B",
    },
    {
        value: "phi kim",
        label: "Phi kim",
        englishLabel: "Non-metals",
        description: "Các nguyên tố phi kim",
        englishDescription: "Non-metallic elements",
        iconName: "radio-button-off-outline", // Changed to a standard UI Kitten icon
        color: "#10B981",
    },
    {
        value: "trung tính",
        label: "Trung tính",
        englishLabel: "Metalloids",
        description: "Các nguyên tố bán kim",
        englishDescription: "Semi-metallic elements",
        iconName: "alert-triangle-outline", // Changed to a standard UI Kitten icon
        color: "#8B5CF6",
    },
]

const ClassificationTable: React.FC = React.memo(() => {
    const { elements, loading } = usePeriodicTable()
    const tailwind = useTailwind()
    const [classification, setClassification] = useState<Classification_t>("-")
    const { lockLandscape } = useLayout()
    const router = useRouter()

    // Animation for classification changes
    const [fadeAnim] = useState(new Animated.Value(1))
    const [scaleAnim] = useState(new Animated.Value(1))

    useEffect(() => {
        // Combined animations when classification changes
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
        ]).start()
    }, [classification])

    useEffect(() => {
        lockLandscape()
    }, [])

    if (loading) {
        return <LoadingBars />
    }

    // Filter elements based on selected classification
    const filteredElements: CellElement_t[] = []
    elements.forEach((element) => {
        if (classification === "-" || element.classification === classification) {
            element.isLightOn = true
            filteredElements.push(element)
        } else {
            element.isLightOn = false
            filteredElements.push(element) // Still add dimmed elements
        }
    })

    // Find the current classification data
    const currentClassData = CLASSIFICATION_DATA.find((c) => c.value === classification)

    // Get background gradient colors based on classification
    const getBackgroundGradient = (): [string, string] => {
        switch (classification) {
            case "kim loại":
                return ["#7F1D1D", "#B45309"]
            case "phi kim":
                return ["#064E3B", "#065F46"]
            case "trung tính":
                return ["#4C1D95", "#5B21B6"]
            default:
                return ["#0F172A", "#1E293B"]
        }
    }

    return (
        <LinearGradient colors={getBackgroundGradient()} style={tailwind("flex-1")}>
            {/* Classification title display */}
            {classification !== "-" && (
                <View style={tailwind("absolute top-4 left-0 right-0 items-center z-1")}>
                    <LinearGradient
                        colors={["rgba(15, 23, 42, 0.9)", "rgba(30, 41, 59, 0.9)"]}
                        style={styles.classificationBadge}
                    >
                        <View style={[styles.colorIndicator, { backgroundColor: currentClassData?.color || "#94A3B8" }]} />

                        <View style={tailwind("ml-2")}>
                            <Text style={tailwind("text-white/100 text-xl font-bold")}>{currentClassData?.label}</Text>
                            <Text style={tailwind("text-gray-300/100 text-sm")}>{currentClassData?.englishLabel}</Text>
                        </View>
                    </LinearGradient>
                </View>
            )}

            {/* Periodic table with animations */}
            <Animated.View
                style={[
                    tailwind("flex-1 p-2"),
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                    classification !== "-" && tailwind("pt-16"),
                ]}
            >
                <PeriodicTableFrame
                    elementUIs={GenerateElementUIs(filteredElements, tailwind, router)}
                    contentForInfoBox={<ClassificationLegend currentClassification={classification} tailwind={tailwind} />}
                />
            </Animated.View>

            {/* Classification selector */}
            <View style={tailwind("absolute bottom-2 left-0 right-0")}>
                <ClassificationSelector
                    currentClassification={classification}
                    onClassificationChange={setClassification}
                    tailwind={tailwind}
                />
            </View>
        </LinearGradient>
    )
})

export default ClassificationTable

// Classification legend component
interface ClassificationLegendProps {
    currentClassification: Classification_t
    tailwind: (_classNames: string) => Style
}

const ClassificationLegend: React.FC<ClassificationLegendProps> = ({ currentClassification, tailwind }) => {
    // Only show legend when viewing all elements
    if (currentClassification !== "-") return null

    return (
        <View style={tailwind("flex-1 p-2")}>
            <View style={[tailwind("bg-white/100 rounded-xl p-3"), styles.legendContainer]}>
                <Text style={tailwind("text-gray-800/100 text-lg font-bold mb-2 text-center")}>Phân loại nguyên tố</Text>
                <Text style={tailwind("text-gray-600/100 text-sm mb-2 text-center")}>Element Classification</Text>

                <View style={tailwind("flex-row justify-around")}>
                    {CLASSIFICATION_DATA.filter((c) => c.value !== "-").map((classification) => (
                        <View key={classification.value} style={tailwind("items-center m-1")}>
                            <View style={[styles.classificationSwatch, { backgroundColor: classification.color }]}>
                                <Icon name={classification.iconName} width={20} height={20} fill="#FFFFFF" />
                            </View>
                            <Text style={tailwind("text-gray-800/100 font-bold text-center")}>{classification.label}</Text>
                            <Text style={tailwind("text-gray-600/100 text-xs text-center")}>{classification.englishLabel}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
}

// Compact classification selector component
interface ClassificationSelectorProps {
    tailwind: (_classNames: string) => Style
    currentClassification: Classification_t
    onClassificationChange: (classification: Classification_t) => void
}

const ClassificationSelector: React.FC<ClassificationSelectorProps> = ({
    currentClassification,
    onClassificationChange,
    tailwind,
}) => {
    const [expanded, setExpanded] = useState(false)

    return (
        <View style={tailwind("px-2")}>
            <View style={[tailwind("bg-gray-800/100 rounded-xl"), styles.selectorContainer]}>
                {/* Header with current selection and expand button */}
                <TouchableOpacity
                    onPress={() => setExpanded(!expanded)}
                    style={tailwind("flex-row items-center justify-between px-3 py-2")}
                >
                    <View style={tailwind("flex-row items-center")}>
                        <Text style={tailwind("text-white/100 font-bold mr-2")}>
                            {CLASSIFICATION_DATA.find((c) => c.value === currentClassification)?.label || "Tất cả"}
                        </Text>
                        <Text style={tailwind("text-gray-400/100 text-sm")}>
                            {CLASSIFICATION_DATA.find((c) => c.value === currentClassification)?.englishLabel || "All Elements"}
                        </Text>
                        {currentClassification !== "-" && (
                            <View
                                style={[
                                    styles.miniColorIndicator,
                                    {
                                        backgroundColor:
                                            CLASSIFICATION_DATA.find((c) => c.value === currentClassification)?.color || "#94A3B8",
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

                {/* Expanded content */}
                {expanded && (
                    <View style={tailwind("p-2")}>
                        <View style={tailwind("flex-row justify-around")}>
                            {CLASSIFICATION_DATA.map((classItem) => (
                                <TouchableOpacity
                                    key={classItem.value}
                                    onPress={() => {
                                        onClassificationChange(classItem.value as Classification_t)
                                        setExpanded(false)
                                    }}
                                    style={[
                                        styles.classificationButton,
                                        {
                                            backgroundColor: currentClassification === classItem.value ? classItem.color : "#1E293B",
                                            borderColor: currentClassification === classItem.value ? classItem.color : "#334155",
                                        },
                                    ]}
                                >
                                    <Icon
                                        name={classItem.iconName}
                                        width={24}
                                        height={24}
                                        fill={currentClassification === classItem.value ? "#FFFFFF" : "#94A3B8"}
                                        style={tailwind("mb-1")}
                                    />

                                    <Text
                                        style={[
                                            styles.classificationLabel,
                                            { color: currentClassification === classItem.value ? "#FFFFFF" : "#94A3B8" },
                                        ]}
                                    >
                                        {classItem.label}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.classificationSubLabel,
                                            { color: currentClassification === classItem.value ? "#FFFFFF" : "#64748B" },
                                        ]}
                                    >
                                        {classItem.englishLabel}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Description of selected classification */}
                        <View style={tailwind("mt-2 pt-2 border-t border-gray-700/100")}>
                            <Text style={tailwind("text-gray-400/100 text-xs text-center")}>
                                {CLASSIFICATION_DATA.find((c) => c.value === currentClassification)?.description}
                            </Text>
                            <Text style={tailwind("text-gray-500/100 text-xs text-center")}>
                                {CLASSIFICATION_DATA.find((c) => c.value === currentClassification)?.englishDescription}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    )
}

// Enhanced styles
const styles = StyleSheet.create({
    classificationBadge: {
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
    classificationButton: {
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
    classificationLabel: {
        fontSize: 14,
        fontWeight: "bold",
    },
    classificationSubLabel: {
        fontSize: 12,
    },
    legendContainer: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    classificationSwatch: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
})
