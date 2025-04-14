// DetailElementScreen.tsx
import {
    checkFavoriteElementStatus, // Import the function to check status
    fetchElementDetails,
    postThisElementIsViewed,
    toggleFavoriteElement
} from "@/api/api";
import CommentsEmptyState from "@/src/components/CommentEmpty";
import { CommentsHeader } from "@/src/components/CommentHeader";
import CommentInput from "@/src/components/CommentInput";
import CommentItem from "@/src/components/CommentItem";
import { useLayout } from "@/src/context/ApplicationLayoutProvider";
import { useElementComments } from "@/src/hooks/useElementComments";
import CustomStyles from "@/src/utils/styles";
import { DetailElement_t, ElementComment, ToggleFavoriteElementResponse } from "@/src/utils/types"; // Corrected path
import { Button, Card, Divider, Spinner, Text } from "@ui-kitten/components"; // Added Spinner
import { LinearGradient } from "expo-linear-gradient";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ColorValue, FlatList, Image, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useTailwind } from "tailwind-rn";

// --- Custom Hook for Element Details ---
const useElementDetails = (elementIdParam: string | string[] | undefined) => {
    const [elementData, setElementData] = useState<DetailElement_t | null>(null);
    const [isFavorite, setIsFavorite] = useState<boolean | null>(null); // Separate state for favorite status
    const [loading, setLoading] = useState<boolean>(true);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState<boolean>(false); // Loading state for toggle action
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const router = useRouter();
    const { lockPortrait } = useLayout();
    // Parse elementId safely
    const elementId = typeof elementIdParam === 'string' ? parseInt(elementIdParam, 10) : NaN;

    const loadData = useCallback(async (refresh = false) => {
        if (isNaN(elementId)) {
            setError("Invalid Element ID");
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (refresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null); // Clear previous errors

        try {
            // Mark as viewed and fetch details/status concurrently
            await postThisElementIsViewed(elementId); // Mark as viewed first or concurrently
            const [data, favoriteStatusResponse] = await Promise.all([
                fetchElementDetails(elementId),
                checkFavoriteElementStatus(elementId) // Fetch initial favorite status
            ]);

            if (data !== null) {
                setElementData(data);
                setError(null);
            } else {
                setElementData(null); // Clear data if fetch fails
                setError("Could not fetch element data.");
            }

            if (favoriteStatusResponse !== null) {
                setIsFavorite(favoriteStatusResponse.active); // Set favorite status from API
            } else {
                // Handle case where favorite status check fails (e.g., network error, 404 if not applicable)
                // Decide default: null (unknown), or false? Let's use null for unknown.
                setIsFavorite(null);
                console.warn(`Could not fetch favorite status for element ${elementId}.`);
            }

        } catch (err) {
            console.error("Error loading element data:", err);
            setError("An error occurred while fetching data.");
            setElementData(null); // Clear data on error
            setIsFavorite(null); // Reset favorite status on error
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [elementId]); // Depend on elementId

    useEffect(() => {
        lockPortrait();
        loadData();
    }, []); // Run loadData when elementId changes

    const goToPrevious = () => {
        if (!isNaN(elementId) && elementId > 1) {
            // Use replace to avoid building up history for prev/next navigation
            router.replace(`/detailelement/${elementId - 1}` as Href);
        }
    };

    const goToNext = () => {
        // Consider element limit (e.g., 118) - Optional
        if (!isNaN(elementId)) {
            router.replace(`/detailelement/${elementId + 1}` as Href);
        }
    };

    const handleToggleFavorite = async () => {
        if (elementData === null || isNaN(elementId)) return; // Can't toggle if no element or invalid ID

        setIsTogglingFavorite(true);
        try {
            const response: ToggleFavoriteElementResponse | null = await toggleFavoriteElement(elementId);
            if (response !== null) {
                // Update local state based on the response from the API
                setIsFavorite(response.active);
            } else {
                // Handle toggle failure (show toast?)
                console.error("Failed to toggle favorite status.");
                // Optionally revert UI state or show error message
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
            // Handle error (show toast?)
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    return {
        elementData,
        isFavorite,
        loading,
        error,
        refreshing, // Expose refreshing state
        loadData, // Expose loadData for pull-to-refresh
        goToPrevious,
        goToNext,
        handleToggleFavorite,
        isTogglingFavorite, // Expose toggle loading state
        goToPreviousDisabled: isNaN(elementId) || elementId <= 1,
    };
};


// --- Main Screen Component ---
const DetailElementScreen = () => {
    const { elementId } = useLocalSearchParams();
    const tw = useTailwind();

    const {
        elementData, // Renamed from favoriteElement
        isFavorite, // New state for favorite status
        loading,
        error,
        refreshing,
        loadData,
        goToPrevious,
        goToNext,
        goToPreviousDisabled,
        handleToggleFavorite,
        isTogglingFavorite, // Loading state for the toggle button
    } = useElementDetails(elementId); // Pass param directly

    // Loading Indicator for Toggle Button
    const ToggleLoadingIndicator = (props: any): React.ReactElement => (
        <View style={[props.style, styles.indicator]}>
            <Spinner size='small' status='control' />
        </View>
    );


    if (loading) {
        return (
            <View style={tw("flex-1 justify-center items-center bg-white/100 p-4")}>
                <ActivityIndicator size="large" color={tw('text-purple-600/100').color as string} />
                <Text style={tw("mt-4 text-gray-600/100")}>Loading Element Details...</Text>
            </View>
        );
    }

    if (error || elementData === null) {
        return (
            <View style={tw("flex-1 justify-center items-center bg-white/100 p-6")}>
                <Text category="h6" style={tw("text-red-600/100 text-center mb-4")}>
                    {error || "Element information not found."}
                </Text>
                <Button onPress={() => loadData()} status="primary" appearance="outline">
                    Retry
                </Button>
            </View>
        );
    }

    // Main content render
    return (
        <ScrollView
            style={tw("flex-1 bg-gray-100/100")}
            showsVerticalScrollIndicator={false}
            refreshControl={ // Added RefreshControl
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => loadData(true)}
                    colors={[tw('text-purple-600/100').color as string]}
                    tintColor={tw('text-purple-600/100').color as string}
                />
            }
        >
            {/* Pass elementData to child components */}
            <ElementHeader element={elementData} />
            <ElementClassification element={elementData} />
            <ElementPhysicalProps element={elementData} />
            <ElementElectronicProps element={elementData} />
            <ElementAtomicProps element={elementData} />
            <ElementOtherInfo element={elementData} />

            {/* Next, Previous & Favorite Buttons */}
            <View style={tw("flex-row justify-between p-4 mt-2 mb-4")}>
                <Button
                    onPress={goToPrevious}
                    disabled={goToPreviousDisabled || loading || refreshing}
                    style={tw("flex-1 mr-2")}
                    appearance="outline" // Less prominent style
                >
                    Previous
                </Button>
                {/* Favorite Button - uses isFavorite state */}
                <Button
                    status={isFavorite ? "danger" : "success"} // Use correct status based on isFavorite
                    style={tw("flex-1")}
                    onPress={handleToggleFavorite}
                    disabled={isFavorite === null || isTogglingFavorite || loading || refreshing} // Disable if status unknown or during toggle/load
                    accessoryLeft={isTogglingFavorite ? ToggleLoadingIndicator : undefined}
                >
                    {(evaProps) => (
                        <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-semibold')]}>
                            {isTogglingFavorite ? '...' : (isFavorite ? "Unfavorite" : "Favorite")}
                        </Text>
                    )}
                </Button>
                <Button
                    onPress={goToNext}
                    disabled={loading || refreshing} // Add disable check
                    style={tw("flex-1 ml-2")}
                    appearance="outline"
                >
                    Next
                </Button>
            </View>
            <ElementCommentSection elementId={Number(elementId) ?? 1} />
        </ScrollView>
    );
};

export default DetailElementScreen;


// --- Child Components ---

const defaultNA = "N/A"; // Default value for missing data

// Helper to format potentially null/undefined numbers
const formatValue = (value: number | string | null | undefined, unit: string = ""): string => {
    if (value === null || value === undefined || value === "-") {
        return defaultNA;
    }
    // Check if it's a number before adding unit, handle existing units
    if (typeof value === 'number' && !isNaN(value)) {
        return `${value}${unit ? ` ${unit}` : ''}`;
    }
    // If it's already a string, return it (might already have unit or be 'N/A')
    return String(value);
};


interface ElementInfoCardProps {
    title: string;
    properties: PropertyPair[];
}

type PropertyPair = {
    label: string;
    value: string | number | React.ReactNode | null | undefined; // Allow null/undefined
    unit?: string; // Optional unit
};

const ElementInfoCard: React.FC<ElementInfoCardProps> = ({ title, properties }) => {
    const tw = useTailwind();

    return (
        <Card style={[tw("m-4 bg-white/100 rounded-lg"), CustomStyles.shadow]}>
            <Text category="h6" style={tw("mb-3 font-bold text-gray-800/100")}>
                {title}
            </Text>
            <Divider style={tw("mb-3 bg-gray-200/100")} />

            {properties.map((prop, index) => (
                <View key={`${title}-${index}-${prop.label}`} style={tw("flex-row justify-between items-center mb-2 py-1")}>
                    <Text style={tw("text-gray-600/100 text-sm")}>{prop.label}:</Text>
                    {/* Handle ReactNode separately */}
                    {React.isValidElement(prop.value) ? (
                        prop.value
                    ) : (
                        // Use formatValue for strings/numbers/null/undefined
                        <Text style={tw("text-gray-800/100 font-medium text-sm text-right")}>
                            {formatValue(prop.value as string | number | null | undefined, prop.unit)}
                        </Text>
                    )}
                </View>
            ))}
        </Card>
    );
};

const ElementCommentSection: React.FC<{ elementId: number }> = ({ elementId }) => {
    const {
        comments,
        isLoadingInitial: isCommentsLoading,
        isFetchingMore: isFetchingMoreComments,
        error: commentsError,
        fetchMoreComments,
        handleCommentSubmit,
        loadingLikeCommentId,
        onLikeElementComment,
    } = useElementComments(elementId);
    const tailwind = useTailwind();
    const renderEmptyComments = () => {
        if (!isCommentsLoading && !commentsError && comments && comments.length === 0) {
            return <CommentsEmptyState tailwind={tailwind} />;
        }
        return null;
    };
    return (
        <View style={tailwind('flex-1 bg-gray-900/100 p-2')}>
            <CommentsHeader
                tailwind={tailwind}
                isCommentsLoading={isCommentsLoading}
                commentsError={commentsError}
            />

            <FlatList
                showsVerticalScrollIndicator={false}
                data={comments}
                renderItem={({ item }: { item: ElementComment }) => (
                    <View style={tailwind('mb-2')}>
                        <CommentItem comment={item} onLikeComment={onLikeElementComment} loadingLikeCommentId={loadingLikeCommentId} />
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={fetchMoreComments}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    <>
                        {isFetchingMoreComments && (
                            <View style={tailwind('py-6 items-center')}>
                                <ActivityIndicator size="small" color={tailwind('text-purple-400/100').color as ColorValue} />
                            </View>
                        )}
                        <View style={tailwind('h-4')} />
                    </>
                }
                ListEmptyComponent={renderEmptyComments}
                contentContainerStyle={tailwind('pb-20')} // Add more padding to accommodate the input
            />

            {/* Add the comment input at the bottom */}
            <View style={tailwind('absolute bottom-0 left-0 right-0 px-2 pb-2 bg-gray-900/100')}>
                <CommentInput onSubmit={handleCommentSubmit} />
            </View>
        </View>
    )
}

interface ElementHeaderProps {
    element: DetailElement_t;
}

const ElementHeader: React.FC<ElementHeaderProps> = ({ element }) => {
    const tw = useTailwind();

    return (
        // Use a different background or style for the header card

        <LinearGradient
            colors={['#7C3AEDFF', '#4F46E5FF']} // from-purple-600 to-indigo-600
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[tw("m-4 p-5 rounded-lg"), CustomStyles.shadow]}
        >
            <View style={tw("flex-row justify-between items-center")}>

                <View style={tw("flex-shrink pr-4")}>
                    {/* Larger Symbol */}
                    <Text style={tw("text-4xl font-bold text-white/100")}>
                        {element.symbol}
                    </Text>
                    <View>

                        <Text category="h5" style={tw("text-white/100 font-semibold mt-1")}>{element.name}</Text>
                        <Text category="s1" style={tw("text-purple-200/100 mt-1")}>Atomic Number: {element.atomicNumber}</Text>
                    </View>
                </View>


                {/* Element Image */}
                {element.image ? (
                    <Image
                        source={{ uri: element.image }}
                        style={tw("w-24 h-24 rounded-lg border-2 border-white/100 bg-white/20")} // Added background/border
                        resizeMode="contain"
                    // Add default source?
                    />
                ) : (
                    // Placeholder if no image
                    <View style={tw("w-24 h-24 rounded-lg border-2 border-white/100 bg-white/20 justify-center items-center")}>
                        <Text style={tw("text-white/50")}>No Image</Text>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
};


interface ElementClassificationProps {
    element: DetailElement_t;
}

const ElementClassification: React.FC<ElementClassificationProps> = ({ element }) => {
    const classificationProperties: PropertyPair[] = [
        { label: "Classification", value: element.classification },
        { label: "Group", value: element.groupNumber },
        { label: "Period", value: element.period },
        { label: "Block", value: element.block },
    ];

    return <ElementInfoCard title="Classification" properties={classificationProperties} />;
};


interface ElementPhysicalPropsProps {
    element: DetailElement_t;
}

const ElementPhysicalProps: React.FC<ElementPhysicalPropsProps> = ({ element }) => {
    const physicalProperties: PropertyPair[] = [
        { label: "Atomic Mass", value: element.atomicMass, unit: "u" }, // Assuming atomicMass is number-like string or number
        { label: "Melting Point", value: element.meltingPoint, unit: "K" },
        { label: "Boiling Point", value: element.boilingPoint, unit: "K" },
        { label: "Density", value: element.density, unit: "g/cm³" },
        { label: "Standard State", value: element.standardState },
    ];

    return <ElementInfoCard title="Physical Properties" properties={physicalProperties} />;
};


interface ElementElectronicPropsProps {
    element: DetailElement_t;
}

const ElementElectronicProps: React.FC<ElementElectronicPropsProps> = ({ element }) => {
    const renderOxidationStates = (states: number[] | null | undefined): string => {
        if (!states || states.length === 0) {
            return defaultNA;
        }
        return states.join(", ");
    };

    const electronicProperties: PropertyPair[] = [
        { label: "Configuration", value: element.electronicConfiguration },
        { label: "Electronegativity", value: element.electronegativity }, // Pauling scale usually unitless
        { label: "Ionization Energy", value: element.ionizationEnergy, unit: "eV" },
        { label: "Electron Affinity", value: element.electronAffinity, unit: "eV" },
        { label: "Oxidation States", value: renderOxidationStates(element.oxidationStates) },
    ];

    return <ElementInfoCard title="Electronic Properties" properties={electronicProperties} />;
};


interface ElementAtomicPropsProps {
    element: DetailElement_t;
}

const ElementAtomicProps: React.FC<ElementAtomicPropsProps> = ({ element }) => {
    const atomicProperties: PropertyPair[] = [
        { label: "Atomic Radius", value: element.atomicRadius, unit: "pm" },
        { label: "Ion Radius", value: element.ionRadius, unit: "pm" }, // Note: type is string | null
        { label: "Van der Waals Radius", value: element.vanDelWaalsRadius, unit: "pm" },
    ];

    return <ElementInfoCard title="Atomic Size" properties={atomicProperties} />;
};


interface ElementOtherInfoProps {
    element: DetailElement_t;
}

const ElementOtherInfo: React.FC<ElementOtherInfoProps> = ({ element }) => {
    const otherProperties: PropertyPair[] = [
        { label: "Bonding Type", value: element.bondingType },
        { label: "Year Discovered", value: element.yearDiscovered },
    ];

    return <ElementInfoCard title="Other Information" properties={otherProperties} />;
};


// Add StyleSheet for spinner positioning
const styles = StyleSheet.create({
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});