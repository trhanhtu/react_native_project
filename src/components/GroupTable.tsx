"use client"

import { Icon, Text } from "@ui-kitten/components"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from "react-native"
import { type Style, useTailwind } from "tailwind-rn"
import { useLayout } from "../context/ApplicationLayoutProvider"
import { usePeriodicTable } from "../context/PeriodicTableProvider"
import GenerateElementUIs from "../utils/GenerateArrayElementUI"
import type { CellElement_t, Group_t } from "../utils/types"
import LoadingBars from "./LoadingBars"
import PeriodicTableFrame from "./PeriodicTableFrame"

// Group data with descriptive names and properties
const GROUP_DATA = [
  { value: "-", label: "All", icon: "grid", description: "All Groups", color: "#3B82F6" },
  { value: "1", label: "1", description: "Alkali Metals", color: "#EF4444" },
  { value: "2", label: "2", description: "Alkaline Earth Metals", color: "#F97316" },
  { value: "3", label: "3", description: "Transition Metals", color: "#FBBF24" },
  { value: "4", label: "4", description: "Transition Metals", color: "#FBBF24" },
  { value: "5", label: "5", description: "Transition Metals", color: "#FBBF24" },
  { value: "6", label: "6", description: "Transition Metals", color: "#FBBF24" },
  { value: "7", label: "7", description: "Transition Metals", color: "#FBBF24" },
  { value: "8", label: "8", description: "Transition Metals", color: "#FBBF24" },
  { value: "9", label: "9", description: "Transition Metals", color: "#FBBF24" },
  { value: "10", label: "10", description: "Transition Metals", color: "#FBBF24" },
  { value: "11", label: "11", description: "Transition Metals", color: "#FBBF24" },
  { value: "12", label: "12", description: "Transition Metals", color: "#FBBF24" },
  { value: "13", label: "13", description: "Boron Group", color: "#A3E635" },
  { value: "14", label: "14", description: "Carbon Group", color: "#A3E635" },
  { value: "15", label: "15", description: "Pnictogen Group", color: "#A3E635" },
  { value: "16", label: "16", description: "Chalcogen Group", color: "#A3E635" },
  { value: "17", label: "17", description: "Halogens", color: "#22D3EE" },
  { value: "18", label: "18", description: "Noble Gases", color: "#818CF8" },
  { value: "lan", label: "Ln", description: "Lanthanides", color: "#C084FC" },
  { value: "act", label: "Ac", description: "Actinides", color: "#C084FC" },
]

const GroupTable: React.FC = React.memo(() => {
  const { elements, loading } = usePeriodicTable()
  const tailwind = useTailwind()
  const [group, setGroup] = useState<Group_t>("-")
  const { lockLandscape } = useLayout()
  const router = useRouter()

  // Animation for group changes
  const [fadeAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    // Fade animation when group changes
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
    ]).start()
  }, [group])

  useEffect(() => {
    lockLandscape()
  }, [])

  if (loading) {
    return <LoadingBars />
  }

  // Filter elements based on selected group
  const filteredElements: CellElement_t[] = []
  elements.forEach((element) => {
    if (group === "-" || element.groupNumber === group) {
      element.isLightOn = true
      filteredElements.push(element)
    } else {
      element.isLightOn = false
      filteredElements.push(element) // Still add dimmed elements
    }
  })

  // Find the current group data
  const currentGroupData = GROUP_DATA.find((g) => g.value === group)

  return (
    <LinearGradient colors={["#0F172A", "#1E293B"]} style={tailwind("flex-1")}>
      {/* Group title display */}
      {group !== "-" && (
        <View style={tailwind("absolute top-4 left-0 right-0 items-center z-10")}>
          <LinearGradient colors={["rgba(15, 23, 42, 0.9)", "rgba(30, 41, 59, 0.9)"]} style={styles.groupBadge}>
            <View style={[styles.colorIndicator, { backgroundColor: currentGroupData?.color || "#94A3B8" }]} />

            <View style={tailwind("ml-2")}>
              <Text style={tailwind("text-white/100 text-xl font-bold")}>
                {currentGroupData?.label === "Ln"
                  ? "Lanthanides"
                  : currentGroupData?.label === "Ac"
                    ? "Actinides"
                    : `Group ${currentGroupData?.label}`}
              </Text>
              {currentGroupData?.description && (
                <Text style={tailwind("text-gray-300/100 text-sm")}>{currentGroupData.description}</Text>
              )}
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Periodic table with fade animation */}
      <Animated.View style={[tailwind("flex-1 p-2"), { opacity: fadeAnim }, group !== "-" && tailwind("pt-16")]}>
        <PeriodicTableFrame elementUIs={GenerateElementUIs(filteredElements, tailwind, router)} />
      </Animated.View>

      {/* Compact group selector */}
      <View style={tailwind("absolute bottom-2 left-0 right-0")}>
        <CompactGroupSelector currentGroup={group} onGroupChange={setGroup} tailwind={tailwind} />
      </View>
    </LinearGradient>
  )
})

export default GroupTable

// Compact group selector component
interface CompactGroupSelectorProps {
  tailwind: (_classNames: string) => Style
  currentGroup: Group_t
  onGroupChange: (group: Group_t) => void
}

const CompactGroupSelector: React.FC<CompactGroupSelectorProps> = ({ currentGroup, onGroupChange, tailwind }) => {
  const [expanded, setExpanded] = useState(false)
  const { width } = Dimensions.get("window")

  // Calculate how many buttons can fit in a row
  const buttonWidth = 40 // Width of each button + margin
  const buttonsPerRow = Math.floor(width / buttonWidth)

  // Group the buttons into categories for better organization
  const mainGroups = GROUP_DATA.filter((g) => g.value === "-")
  const standardGroups = GROUP_DATA.filter((g) => g.value !== "-" && g.value !== "lan" && g.value !== "act")
  const specialGroups = GROUP_DATA.filter((g) => g.value === "lan" || g.value === "act")

  return (
    <View style={tailwind("px-2")}>
      <View style={[tailwind("bg-gray-800/100 rounded-xl"), styles.compactSelectorContainer]}>
        {/* Header with current selection and expand button */}
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={tailwind("flex-row items-center justify-between px-3 py-2")}
        >
          <View style={tailwind("flex-row items-center")}>
            <Text style={tailwind("text-white/100 font-bold mr-2")}>
              {currentGroup === "-"
                ? "All Groups"
                : currentGroup === "lan"
                  ? "Lanthanides"
                  : currentGroup === "act"
                    ? "Actinides"
                    : `Group ${currentGroup}`}
            </Text>
            {currentGroup !== "-" && (
              <View
                style={[
                  styles.miniColorIndicator,
                  { backgroundColor: GROUP_DATA.find((g) => g.value === currentGroup)?.color || "#94A3B8" },
                ]}
              />
            )}
          </View>

          <Icon name={expanded ? "chevron-down" : "chevron-right"} width={20} height={20} fill="#FFFFFF" />
        </TouchableOpacity>

        {/* Expanded content */}
        {expanded && (
          <View style={tailwind("px-2 pb-2")}>
            {/* Main "All" button */}
            <View style={tailwind("flex-row mb-1")}>
              {mainGroups.map((groupItem) => (
                <CompactGroupButton
                  key={groupItem.value}
                  group={groupItem}
                  isActive={currentGroup === groupItem.value}
                  onPress={() => {
                    onGroupChange(groupItem.value as Group_t)
                    setExpanded(false)
                  }}
                  wide
                />
              ))}
            </View>

            {/* Standard groups in a grid */}
            <View style={tailwind("flex-row flex-wrap")}>
              {standardGroups.map((groupItem) => (
                <CompactGroupButton
                  key={groupItem.value}
                  group={groupItem}
                  isActive={currentGroup === groupItem.value}
                  onPress={() => {
                    onGroupChange(groupItem.value as Group_t)
                    setExpanded(false)
                  }}
                />
              ))}
            </View>

            {/* Special groups */}
            <View style={tailwind("flex-row mt-1")}>
              {specialGroups.map((groupItem) => (
                <CompactGroupButton
                  key={groupItem.value}
                  group={groupItem}
                  isActive={currentGroup === groupItem.value}
                  onPress={() => {
                    onGroupChange(groupItem.value as Group_t)
                    setExpanded(false)
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

// Compact group button component
interface CompactGroupButtonProps {
  group: (typeof GROUP_DATA)[0]
  isActive: boolean
  onPress: () => void
  wide?: boolean
}

const CompactGroupButton: React.FC<CompactGroupButtonProps> = ({ group, isActive, onPress, wide = false }) => {
  const tailwind = useTailwind()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.compactGroupButton,
        wide && styles.wideGroupButton,
        {
          backgroundColor: isActive ? group.color : "#1E293B",
          borderColor: isActive ? group.color : "#334155",
        },
      ]}
    >
      {group.icon ? (
        <Icon name={group.icon} width={16} height={16} fill={isActive ? "#FFFFFF" : "#94A3B8"} />
      ) : (
        <Text style={[styles.compactGroupLabel, { color: isActive ? "#FFFFFF" : "#94A3B8" }]}>{group.label}</Text>
      )}
    </TouchableOpacity>
  )
}

// Enhanced styles
const styles = StyleSheet.create({
  groupBadge: {
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
  },
  compactSelectorContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  compactGroupButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    margin: 2,
    borderRadius: 6,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
  },
  wideGroupButton: {
    width: 80,
    flexDirection: "row",
  },
  compactGroupLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
})
