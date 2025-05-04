import { Icon, Text } from "@ui-kitten/components";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { useLayout } from "../context/ApplicationLayoutProvider";
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import GenerateElementUIs from "../utils/GenerateArrayElementUI";
import { CellElement_t, Period_t } from "../utils/types";
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

// Period labels with more descriptive names
const PERIOD_DATA = [
  { value: "-", label: "Mọi", icon: "grid" },
  { value: "1", label: "Kỳ 1", description: "H, He" },
  { value: "2", label: "Kỳ 2", description: "Li → Ne" },
  { value: "3", label: "Kỳ 3", description: "Na → Ar" },
  { value: "4", label: "Kỳ 4", description: "K → Kr" },
  { value: "5", label: "kỳ 5", description: "Rb → Xe" },
  { value: "6", label: "kỳ 6", description: "Cs → Rn" },
  { value: "7", label: "kỳ 7", description: "Fr → Og" },
  { value: "lan", label: "Lanthanides", icon: "alert-triangle" },
  { value: "act", label: "Actinides", icon: "alert-triangle" }
];

const PeriodTable: React.FC = React.memo(() => {
  const { elements, loading } = usePeriodicTable();
  const tailwind = useTailwind();
  const [period, setPeriod] = useState<Period_t>("-");
  const { lockLandscape } = useLayout();
  const router = useRouter();
  
  // Animation for period changes
  const [fadeAnim] = useState(new Animated.Value(1));
  
  useEffect(() => {
    // Fade animation when period changes
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  }, [period]);
  
  useEffect(() => {
    lockLandscape();
  }, []);
  
  if (loading) {
    return <LoadingBars />;
  }
  
  // Filter elements based on selected period
  const filteredElements: CellElement_t[] = [];
  elements.forEach(element => {
    if (period === "-" || element.period === period) {
      element.isLightOn = true;
      filteredElements.push(element);
    } else {
      element.isLightOn = false;
      filteredElements.push(element); // Still add dimmed elements
    }
  });
  
  // Find the current period data
  const currentPeriodData = PERIOD_DATA.find(p => p.value === period);

  return (
    <LinearGradient
      colors={['#1E293B', '#0F172A']}
      style={tailwind("flex-1")}
    >
      
      {period !== "-" && (
        <View style={tailwind("absolute top-4 left-0 right-0 items-center z-10")}>
          <View style={styles.periodBadge}>
            <Text style={tailwind("text-white/100 text-xl font-bold")}>
              {currentPeriodData?.label}
            </Text>
            {currentPeriodData?.description && (
              <Text style={tailwind("text-gray-300/100 text-sm")}>
                {currentPeriodData.description}
              </Text>
            )}
          </View>
        </View>
      )}
      
      
      <Animated.View 
        style={[
          tailwind("flex-1 p-2"),
          { opacity: fadeAnim },
          period !== "-" && tailwind("pt-16")
        ]}
      >
        <PeriodicTableFrame
          elementUIs={GenerateElementUIs(filteredElements, tailwind, router)}
        />
      </Animated.View>
      
      
      <View style={tailwind("absolute bottom-2 left-0 right-0")}>
        <PeriodSelector 
          currentPeriod={period}
          onPeriodChange={setPeriod}
          tailwind={tailwind} 
        />
      </View>
    </LinearGradient>
  );
});

export default PeriodTable;

// Enhanced period selector component
interface PeriodSelectorProps {
  tailwind: (_classNames: string) => Style;
  currentPeriod: Period_t;
  onPeriodChange: (period: Period_t) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  currentPeriod, 
  onPeriodChange, 
  tailwind 
}) => {
  return (
    <View style={tailwind("px-4")}>
      <View style={[
        tailwind("bg-gray-800/100 rounded-xl p-3"),
        styles.selectorContainer
      ]}>
        <Text style={tailwind("text-white/100 text-center font-bold mb-2")}>
          Chọn chu kỳ
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tailwind("pb-1")}
        >
          {PERIOD_DATA.map((periodItem) => (
            <TouchableOpacity
              key={periodItem.value}
              onPress={() => onPeriodChange(periodItem.value as Period_t)}
              style={[
                styles.periodButton,
                currentPeriod === periodItem.value ? styles.activePeriodButton : null
              ]}
            >
              {periodItem.icon ? (
                <Icon 
                  name={periodItem.icon} 
                  width={16} 
                  height={16} 
                  fill={currentPeriod === periodItem.value ? "#FFFFFF" : "#94A3B8"} 
                  style={tailwind("mr-1")}
                />
              ) : (
                <Text 
                  style={[
                    styles.periodNumber,
                    { color: currentPeriod === periodItem.value ? "#FFFFFF" : "#94A3B8" }
                  ]}
                >
                  {periodItem.value}
                </Text>
              )}
              
              <Text 
                style={[
                  styles.periodLabel,
                  { color: currentPeriod === periodItem.value ? "#FFFFFF" : "#94A3B8" }
                ]}
              >
                {periodItem.label.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        
        {currentPeriod !== "-" && (
          <View style={tailwind("mt-2 pt-2 border-t border-gray-700/100")}>
            <Text style={tailwind("text-gray-400/100 text-xs text-center")}>
              {PERIOD_DATA.find(p => p.value === currentPeriod)?.description || 
               `Elements in period ${currentPeriod}`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Enhanced styles
const styles = StyleSheet.create({
  periodBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectorContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 70,
  },
  activePeriodButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
  },
  periodNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  periodLabel: {
    fontSize: 14,
  },
});