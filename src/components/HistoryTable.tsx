import Slider from "@react-native-community/slider";
import { Icon, Input, Text } from "@ui-kitten/components";
import { LinearGradient } from 'expo-linear-gradient';
import { Href, Router, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import { useLayout } from '../context/ApplicationLayoutProvider';
import { usePeriodicTable } from "../context/PeriodicTableProvider";
import { CellElement_t } from '../utils/types';
import LoadingBars from "./LoadingBars";
import PeriodicTableFrame from "./PeriodicTableFrame";

const CURRENT_YEAR = new Date().getFullYear();

const HistoryTable: React.FC = React.memo(() => {
  const tailwind = useTailwind();
  const router = useRouter();
  const {
    ChangeTextInput,
    currentSliderYear,
    elements,
    loading,
    setCurrentSliderYear
  } = useHistoryTable();

  // Animation for year changes
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Fade out and in when year changes for a nice effect
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
  }, [currentSliderYear]);

  if (loading) {
    return <LoadingBars />;
  }

  return (
    <ImageBackground
      source={require('@/assets/images/old_paper_background.jpg')}
      style={[tailwind("flex-1"), { width: '100%', height: '100%' }]}
      resizeMode="cover"
    >
      {/* Year display with historical styling */}
      <View style={tailwind("absolute top-4 right-0 items-center z-10")}>
        <View style={[
          tailwind("bg-amber-800/100 rounded-xl p-2 mr-2"),
          styles.yearBadge
        ]}>
          <Text style={tailwind("text-amber-100/100 text-2xl font-bold")}>
            {currentSliderYear > 0 ? currentSliderYear : 'Ancient Times'}
          </Text>
        </View>
      </View>

      {/* Periodic table with fade animation */}
      <Animated.View
        style={[
          tailwind("flex-1"),
          { opacity: fadeAnim }
        ]}
      >
        <PeriodicTableFrame
          elementUIs={GenerateElementUIs(elements, currentSliderYear, tailwind, router)}
        />
      </Animated.View>

      {/* Year controller */}
      <View style={tailwind("absolute bottom-2 left-0 right-0")}>
        <YearController
          ChangeTextInput={ChangeTextInput}
          currentSliderYear={currentSliderYear}
          setCurrentSliderYear={setCurrentSliderYear}
          tailwind={tailwind}
        />
      </View>
    </ImageBackground>
  );
});

export default HistoryTable;

// Improved element UI generation with better visual design
function GenerateElementUIs(
  elements: CellElement_t[],
  currentYear: number,
  tailwind: (_classNames: string) => Style,
  router: Router
): React.ReactNode[] {
  return elements.map((element, index) => {
    const isDiscovered = element.yearDiscovered <= currentYear;

    return (
      <Pressable
        key={`${index}_`}
        onPress={() => router.push(`/detailelement/${element.atomicNumber}` as Href)}
        style={({ pressed }) => [
          styles.elementContainer,
          pressed && styles.elementPressed
        ]}
      >
        <View
          style={[
            tailwind(isDiscovered ? "bg-amber-700/100" : "bg-amber-200/100"),
            styles.elementCard,
            isDiscovered && styles.discoveredElement
          ]}
        >
          {/* Element symbol */}
          <Text
            category="h3"
            style={[
              tailwind(isDiscovered ? "text-amber-100/100" : "text-amber-900/100"),
              styles.elementSymbol
            ]}
          >
            {element.symbol}
          </Text>

          {/* Atomic number */}
          <Text
            style={[
              tailwind(isDiscovered ? "text-amber-200/100" : "text-amber-800/100"),
              styles.atomicNumber
            ]}
          >
            {element.atomicNumber}
          </Text>

          {/* Discovery year for discovered elements */}
          {isDiscovered && element.yearDiscovered > 0 && (
            <Text
              style={tailwind("text-xs text-amber-300/100 absolute bottom-1 right-1")}
            >
              {element.yearDiscovered}
            </Text>
          )}

          {/* Decorative corner for discovered elements */}
          {isDiscovered && (
            <View style={styles.cornerDecoration} />
          )}
        </View>
      </Pressable>
    );
  });
}

// Redesigned year controller with historical styling
interface YearControllerProps {
  tailwind: (_classNames: string) => Style;
  ChangeTextInput: (v: string) => void;
  currentSliderYear: number;
  setCurrentSliderYear: React.Dispatch<React.SetStateAction<number>>;
}

const YearController: React.FC<YearControllerProps> = ({
  ChangeTextInput,
  currentSliderYear,
  setCurrentSliderYear,
  tailwind
}) => {
  // Predefined historical periods for quick navigation
  const historicalPeriods = [
    { year: 0, label: "Ancient" },
    { year: 1000, label: "Medieval" },
    { year: 1700, label: "Industrial" },
    { year: 1900, label: "Modern" },
    { year: CURRENT_YEAR, label: "Present" }
  ];

  return (
    <View style={tailwind("px-4")}>
      {/* Historical period quick select */}
      <View style={tailwind("flex-row justify-between mb-2")}>
        {historicalPeriods.map((period) => (
          <TouchableOpacity
            key={period.label}
            onPress={() => setCurrentSliderYear(period.year)}
            style={[
              tailwind("items-center px-2 py-1"),
              currentSliderYear === period.year && tailwind("bg-amber-700/100 rounded-lg")
            ]}
          >
            <Text category="c1"
              style={tailwind(
                currentSliderYear === period.year
                  ? "text-amber-100/100 font-bold"
                  : "text-amber-800/100"
              )}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main controller with slider */}
      <LinearGradient
        colors={['#8B4513', '#A0522D', '#CD853F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          tailwind("rounded-xl p-4"),
          styles.controllerContainer
        ]}
      >
        <TouchableOpacity
          onPress={() => setCurrentSliderYear(prev => Math.max(0, prev - 10))}
          style={styles.yearButton}
        >
          <Icon name="arrow-back" width={24} height={24} fill="#F5DEB3" />
        </TouchableOpacity>

        <View style={tailwind("flex-1 mx-2")}>
          <Slider
            style={{ width: '100%', height: 40 }}
            value={currentSliderYear}
            onSlidingComplete={(v: number) => setCurrentSliderYear(Math.round(v))}
            minimumValue={0}
            maximumValue={CURRENT_YEAR}
            step={1}
            minimumTrackTintColor="#F5DEB3"
            maximumTrackTintColor="#D2B48C"
            thumbTintColor="#FFD700"
          />

          <View style={tailwind("flex-row justify-between")}>
            <Text category="c2" style={tailwind("text-amber-100/100")}>Ancient</Text>
            <Text category="c2" style={tailwind("text-amber-100/100")}>Present</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setCurrentSliderYear(prev => Math.min(CURRENT_YEAR, prev + 10))}
          style={styles.yearButton}
        >
          <Icon name="arrow-forward" width={24} height={24} fill="#F5DEB3" />
        </TouchableOpacity>

        <View style={styles.yearInputContainer}>
          <Input
            style={[tailwind("text-center bg-amber-100/100"), { width: 80 }]}
            value={currentSliderYear.toString()}
            onChangeText={ChangeTextInput}
            keyboardType="numeric"
            size="small"
            textStyle={{ color: '#8B4513' }}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

// Custom hook for history table functionality
function useHistoryTable() {
  const { elements, loading } = usePeriodicTable();
  const [currentSliderYear, setCurrentSliderYear] = React.useState<number>(0);
  const { lockLandscape } = useLayout();

  const ChangeTextInput = (v: string) => {
    let num = Number(v);
    if (!num && num !== 0) {
      return;
    }
    if (num > CURRENT_YEAR) {
      num = CURRENT_YEAR;
    }
    setCurrentSliderYear(num);
  };

  useEffect(() => lockLandscape(), []);

  return {
    elements,
    loading,
    currentSliderYear,
    ChangeTextInput,
    setCurrentSliderYear,
  };
}

// Enhanced styles for the component
const styles = StyleSheet.create({
  yearBadge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  elementContainer: {
    margin: 1,
    width: 100,
    height: 100,
  },
  elementPressed: {
    transform: [{ scale: 0.95 }],
  },
  elementCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B4513',
    overflow: 'hidden',
  },
  discoveredElement: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  elementSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  atomicNumber: {
    fontSize: 14,
    textAlign: 'center',
    position: 'absolute',
    top: 5,
    left: 5,
  },
  cornerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 15,
    height: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: '#FFD700',
  },
  controllerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  yearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5DEB3',
  },
  yearInputContainer: {
    marginLeft: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#8B4513',
  },
});