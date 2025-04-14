import Slider from '@react-native-community/slider';
import { Icon, Input, Text } from "@ui-kitten/components";
import { LinearGradient } from 'expo-linear-gradient';
import { Router, useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
    Animated,
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

const MAX_TEMPERATURE: number = 6000;

// Temperature presets for quick selection
const TEMPERATURE_PRESETS = [
    { temp: 0, label: "Absolute Zero" },
    { temp: 273, label: "Freezing" },
    { temp: 293, label: "Room Temp" },
    { temp: 373, label: "Boiling" },
    { temp: 1000, label: "Extreme" },
    { temp: 5000, label: "Stellar" }
];

const TemperatureTable: React.FC = React.memo(() => {
    const router = useRouter();
    const tailwind = useTailwind();
    const {
        ChangeTextInput,
        currentTemperature,
        elements,
        loading,
        setCurrentTemperature
    } = useTemperatureTable();

    // Animation for temperature changes
    const [scaleAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        // Pulse animation when temperature changes
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.03,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            })
        ]).start();
    }, [currentTemperature]);

    if (loading) {
        return <LoadingBars />;
    }

    // Get background gradient colors based on temperature
    const getBackgroundGradient = (): [string, string, ...string[]] => {
        if (currentTemperature < 273) {
            return ['#1E3B8A', '#2C52C7']; // Cold blue
        } else if (currentTemperature < 373) {
            return ['#2C52C7', '#3A6ED8']; // Cool blue
        } else if (currentTemperature < 1000) {
            return ['#3A6ED8', '#F97316']; // Blue to orange
        } else if (currentTemperature < 3000) {
            return ['#F97316', '#EF4444']; // Orange to red
        } else {
            return ['#EF4444', '#7C3AED']; // Red to purple (extreme heat)
        }
    };

    return (
        <LinearGradient
            colors={getBackgroundGradient()}
            style={tailwind("flex-1")}
        >
            {/* Temperature display */}
            <View style={tailwind("absolute top-4 left-0 right-0 items-center z-10")}>
                <TemperatureDisplay
                    temperature={currentTemperature}
                    tailwind={tailwind}
                />
            </View>

            {/* Periodic table with animation */}
            <Animated.View
                style={[
                    tailwind("flex-1 flex-col p-2 pt-20"),
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                <PeriodicTableFrame
                    contentForInfoBox={<StateOfMatterLegend />}
                    elementUIs={GenerateElementUIs(elements, currentTemperature, tailwind, router)}
                />
            </Animated.View>

            {/* Temperature controller */}
            <View style={tailwind("absolute bottom-2 left-0 right-0")}>
                <TemperatureController
                    ChangeTextInput={ChangeTextInput}
                    currentTemperature={currentTemperature}
                    setCurrentTemperature={setCurrentTemperature}
                    tailwind={tailwind}
                />
            </View>
        </LinearGradient>
    );
});

export default TemperatureTable;

// Temperature display component
interface TemperatureDisplayProps {
    temperature: number;
    tailwind: (_classNames: string) => Style;
}

const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({
    temperature,
    tailwind
}) => {
    // Get temperature color based on value
    const getTemperatureColor = () => {
        if (temperature < 273) return 'text-blue-300/100';
        if (temperature < 373) return 'text-blue-100/100';
        if (temperature < 1000) return 'text-orange-300/100';
        if (temperature < 3000) return 'text-orange-500/100';
        return 'text-red-500/100';
    };

    // Get temperature icon based on value
    const getTemperatureIcon = () => {
        if (temperature < 273) return 'thermometer-minus';
        if (temperature < 373) return 'thermometer';
        if (temperature < 1000) return 'thermometer-plus';
        return 'activity';
    };

    return (
        <View style={styles.temperatureDisplay}>
            <Icon
                name={getTemperatureIcon()}
                width={28}
                height={28}
                fill="#FFFFFF"
                style={tailwind("mr-2")}
            />
            <Text style={[
                tailwind(`text-2xl font-bold ${getTemperatureColor()}`),
                styles.temperatureText
            ]}>
                {temperature}°K
            </Text>
        </View>
    );
};

// Enhanced element UI generation
function GenerateElementUIs(
    elements: CellElement_t[],
    currentTemperature: number,
    tailwind: (_classNames: string) => Style,
    router: Router
): React.ReactNode[] {
    return elements.map((element, index) => {
        const { bgColor, stateLabel, stateIcon } = getElementState(element, currentTemperature);

        return (
            <Pressable
                key={index}
                onPress={() => router.push(`/detailelement/${element.atomicNumber}`)}
                style={({ pressed }) => [
                    styles.elementContainer,
                    pressed && styles.elementPressed
                ]}
            >
                <View style={[
                    tailwind(bgColor),
                    styles.elementCard
                ]}>
                    {/* Element symbol */}
                    <Text
                        category="h3"
                        style={[
                            tailwind("text-gray-800/100"),
                            styles.elementSymbol
                        ]}
                    >
                        {element.symbol}
                    </Text>

                    {/* Atomic number */}
                    <Text
                        style={[
                            tailwind("text-gray-700/100"),
                            styles.atomicNumber
                        ]}
                    >
                        {element.atomicNumber}
                    </Text>

                    {/* State indicator */}
                    <View style={styles.stateIndicator}>
                        <Icon
                            name={stateIcon}
                            width={16}
                            height={16}
                            fill="#1F2937"
                        />
                        <Text style={tailwind("text-xs text-gray-700/100 ml-1")}>
                            {stateLabel}
                        </Text>
                    </View>

                </View>
            </Pressable>
        );
    });
}

// Helper function to determine element state
function getElementState(element: CellElement_t, currentTemperature: number) {
    // Unknown state
    if (element.boilingPoint === element.meltingPoint && ~~element.meltingPoint === 0) {
        return {
            bgColor: "bg-gray-300/100",
            stateLabel: "Unknown",
            stateIcon: "question-mark-circle"
        };
    }

    // Solid state
    if (currentTemperature < element.meltingPoint) {
        return {
            bgColor: "bg-blue-300/100",
            stateLabel: "Solid",
            stateIcon: "cube"
        };
    }

    // Gas state
    if (currentTemperature > element.boilingPoint) {
        return {
            bgColor: "bg-green-300/100",
            stateLabel: "Gas",
            stateIcon: "activity"
        };
    }

    // Liquid state
    return {
        bgColor: "bg-blue-500/100",
        stateLabel: "Liquid",
        stateIcon: "droplet"
    };
}

// Enhanced legend for states of matter
function StateOfMatterLegend(): React.ReactNode {
    const tailwind = useTailwind();
    return (
        <View style={tailwind("flex-1 flex-row p-2")}>
            <View style={[
                tailwind("flex-1 bg-white/100 rounded-xl p-2"),
                styles.legendContainer
            ]}>
                <Text style={tailwind("text-gray-800/100 text-lg font-bold mb-2 text-center")}>
                    States of Matter
                </Text>

                <View style={tailwind("flex-row flex-wrap justify-around")}>
                    <StateCard
                        color="bg-blue-300/100"
                        icon="cube"
                        label="Solid"
                        description="Below melting point"
                        tailwind={tailwind}
                    />

                    <StateCard
                        color="bg-blue-500/100"
                        icon="droplet"
                        label="Liquid"
                        description="Between melting & boiling"
                        tailwind={tailwind}
                    />

                    <StateCard
                        color="bg-green-300/100"
                        icon="activity"
                        label="Gas"
                        description="Above boiling point"
                        tailwind={tailwind}
                    />

                    <StateCard
                        color="bg-gray-300/100"
                        icon="question-mark-circle"
                        label="Unknown"
                        description="Data not available"
                        tailwind={tailwind}
                    />
                </View>
            </View>
        </View>
    );
}

// Individual state card for the legend
interface StateCardProps {
    color: string;
    icon: string;
    label: string;
    description: string;
    tailwind: (_classNames: string) => Style;
}

const StateCard: React.FC<StateCardProps> = ({
    color,
    icon,
    label,
    description,
    tailwind
}) => {
    return (
        <View style={tailwind("items-center m-1")}>
            <View style={[
                tailwind(`${color} rounded-lg p-2 mb-1`),
                styles.stateCard
            ]}>
                <Icon name={icon} width={24} height={24} fill="#1F2937" />
            </View>
            <Text style={tailwind("text-gray-800/100 font-bold")}>{label}</Text>
            <Text style={tailwind("text-gray-600/100 text-xs text-center")}>{description}</Text>
        </View>
    );
};

// Enhanced temperature controller
interface TemperatureControllerProps {
    tailwind: (_classNames: string) => Style;
    ChangeTextInput: (v: string) => void;
    currentTemperature: number;
    setCurrentTemperature: React.Dispatch<React.SetStateAction<number>>;
}

const TemperatureController: React.FC<TemperatureControllerProps> = ({
    ChangeTextInput,
    currentTemperature,
    setCurrentTemperature,
    tailwind
}) => {
    // Get slider color based on temperature
    const getSliderColor = () => {
        if (currentTemperature < 273) return '#3B82F6';
        if (currentTemperature < 373) return '#60A5FA';
        if (currentTemperature < 1000) return '#F97316';
        if (currentTemperature < 3000) return '#EF4444';
        return '#7C3AED';
    };

    return (
        <View style={tailwind("px-4")}>
            {/* Temperature presets */}
            <View style={tailwind("flex-row justify-between mb-2")}>
                {TEMPERATURE_PRESETS.map((preset) => (
                    <TouchableOpacity
                        key={preset.label}
                        onPress={() => setCurrentTemperature(preset.temp)}
                        style={[
                            tailwind("items-center px-2 py-1 rounded-lg"),
                            currentTemperature === preset.temp && styles.activePreset
                        ]}
                    >
                        <Text
                            style={tailwind(
                                currentTemperature === preset.temp
                                    ? "text-white/100 font-bold"
                                    : "text-gray-100/100"
                            )}
                        >
                            {preset.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Main controller */}
            <View style={[
                tailwind("bg-gray-800/100 rounded-xl p-4 flex-row items-center"),
                styles.controllerContainer
            ]}>
                {/* Temperature decrease button */}
                <TouchableOpacity
                    onPress={() => setCurrentTemperature(prev => Math.max(0, prev - 10))}
                    style={[
                        styles.tempButton,
                        { backgroundColor: '#3B82F6' }
                    ]}
                >
                    <Icon name="minus" width={24} height={24} fill="#FFFFFF" />
                </TouchableOpacity>

                {/* Temperature slider */}
                <View style={tailwind("flex-1 mx-3")}>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        value={currentTemperature}
                        onValueChange={(v: number) => setCurrentTemperature(Math.round(v))}
                        minimumValue={0}
                        maximumValue={MAX_TEMPERATURE}
                        step={1}
                        minimumTrackTintColor={getSliderColor()}
                        maximumTrackTintColor="#4B5563"
                        thumbTintColor={getSliderColor()}
                    />

                    {/* Temperature scale markers */}
                    <View style={tailwind("flex-row justify-between")}>
                        <Text style={tailwind("text-blue-300/100 text-xs")}>0°K</Text>
                        <Text style={tailwind("text-blue-100/100 text-xs")}>273°K</Text>
                        <Text style={tailwind("text-orange-300/100 text-xs")}>1000°K</Text>
                        <Text style={tailwind("text-red-500/100 text-xs")}>6000°K</Text>
                    </View>
                </View>

                {/* Temperature increase button */}
                <TouchableOpacity
                    onPress={() => setCurrentTemperature(prev => Math.min(MAX_TEMPERATURE, prev + 10))}
                    style={[
                        styles.tempButton,
                        { backgroundColor: '#EF4444' }
                    ]}
                >
                    <Icon name="plus" width={24} height={24} fill="#FFFFFF" />
                </TouchableOpacity>

                {/* Temperature input */}
                <View style={styles.tempInputContainer}>
                    <Input
                        style={tailwind("text-center bg-gray-700/100")}
                        textStyle={{ color: '#FFFFFF' }}
                        value={currentTemperature.toString()}
                        onChangeText={ChangeTextInput}
                        keyboardType="numeric"
                        size="small"
                        placeholder="°K"
                    />
                </View>
            </View>
        </View>
    );
};

// Custom hook for temperature table functionality
function useTemperatureTable() {
    const { elements, loading } = usePeriodicTable();
    const [currentTemperature, setCurrentTemperature] = React.useState<number>(293); // Start at room temperature
    const { lockLandscape } = useLayout();

    const ChangeTextInput = (v: string) => {
        let num = Number(v);
        if (!num && num !== 0) {
            return;
        }
        if (num > MAX_TEMPERATURE) {
            num = MAX_TEMPERATURE;
        }
        if (num < 0) {
            num = 0;
        }
        setCurrentTemperature(num);
    };

    useEffect(() => lockLandscape(), []);

    return {
        elements,
        loading,
        currentTemperature,
        ChangeTextInput,
        setCurrentTemperature,
    };
}

// Enhanced styles
const styles = StyleSheet.create({
    temperatureDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    temperatureText: {
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
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
        borderColor: '#1F2937',
        overflow: 'hidden',
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
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
    stateIndicator: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    temperatureInfo: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    legendContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    stateCard: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    controllerContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    tempButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    tempInputContainer: {
        marginLeft: 12,
        width: 80,
        borderRadius: 8,
        overflow: 'hidden',
    },
    activePreset: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
});