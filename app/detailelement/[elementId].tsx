// Filename: DetailElementScreen.tsx
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

//------------------------------------------------------
// Custom Hook: useElementDetails
//------------------------------------------------------
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
        // Guard clause for invalid ID
        if (isNaN(elementId)) {
            setError("ID Nguyên tố không hợp lệ"); // Translated
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
                setError("Không thể tải dữ liệu nguyên tố."); // Translated
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
            setError("Đã xảy ra lỗi khi tải dữ liệu."); // Translated
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadData]); // Run loadData when hook mounts or loadData changes

    const goToPrevious = () => {
        if (!isNaN(elementId) && elementId > 1) {
            // Use replace to avoid building up history for prev/next navigation
            router.replace(`/detailelement/${elementId - 1}` as Href); // Cast to Href<any> or specific route string type
        }
    };

    const goToNext = () => {
        // Consider element limit (e.g., 118) - Optional
        if (!isNaN(elementId)) {
            router.replace(`/detailelement/${elementId + 1}` as Href); // Cast to Href<any> or specific route string type
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
                // Maybe show a toast here in Vietnamese? e.g., toast.error("Không thể thay đổi trạng thái yêu thích.")
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
            // Handle error (show toast?)
            // Maybe show a toast here? e.g., toast.error("Lỗi khi thay đổi trạng thái yêu thích.")
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


//------------------------------------------------------
// Main Screen Component: DetailElementScreen
//------------------------------------------------------
const DetailElementScreen = () => {
    const { elementId } = useLocalSearchParams();
    const tw = useTailwind();

    const {
        elementData,
        isFavorite,
        loading,
        error,
        refreshing,
        loadData,
        goToPrevious,
        goToNext,
        goToPreviousDisabled,
        handleToggleFavorite,
        isTogglingFavorite,
    } = useElementDetails(elementId);

    // Loading Indicator for Toggle Button
    const ToggleLoadingIndicator = (props: any): React.ReactElement => (
        <View style={[props.style, styles.indicator]}>
            <Spinner size='small' status='control' />
        </View>
    );

    //----------------------------------
    // Loading State
    //----------------------------------
    if (loading) {
        return (
            <View style={tw("flex-1 justify-center items-center bg-white/100 p-4")}>
                <ActivityIndicator size="large" color={tw('text-purple-600/100').color as string} />
                <Text style={tw("mt-4 text-gray-600/100")}>Đang tải chi tiết nguyên tố...</Text>
            </View>
        );
    }

    //----------------------------------
    // Error State
    //----------------------------------
    if (error || elementData === null) {
        return (
            <View style={tw("flex-1 justify-center items-center bg-white/100 p-6")}>
                <Text category="h6" style={tw("text-red-600/100 text-center mb-4")}>
                    {error || "Không tìm thấy thông tin nguyên tố."}
                </Text>
                <Button onPress={() => loadData()} status="primary" appearance="outline">
                    Thử lại
                </Button>
            </View>
        );
    }

    //----------------------------------
    // Main Content Render
    //----------------------------------
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

            <ElementHeader element={elementData} />
            <ElementClassification element={elementData} />
            <ElementPhysicalProps element={elementData} />
            <ElementElectronicProps element={elementData} />
            <ElementAtomicProps element={elementData} />
            <ElementOtherInfo element={elementData} />


            <View style={tw("flex-row justify-between p-4 mt-2 mb-4")}>
                <Button
                    onPress={goToPrevious}
                    disabled={goToPreviousDisabled || loading || refreshing}
                    style={tw("flex-1 mr-2")}
                    appearance="outline" // Less prominent style
                >
                    Trước
                </Button>
                <Button
                    status={isFavorite ? "danger" : "success"}
                    style={tw("flex-1")}
                    onPress={handleToggleFavorite}
                    disabled={isFavorite === null || isTogglingFavorite || loading || refreshing}
                    accessoryLeft={isTogglingFavorite ? ToggleLoadingIndicator : undefined}
                >
                    {(evaProps) => (
                        <Text {...evaProps} style={[evaProps?.style, tw('text-white/100 font-semibold')]}>
                            {isTogglingFavorite ? '...' : (isFavorite ? "Bỏ thích" : "Yêu thích")}
                        </Text>
                    )}
                </Button>
                <Button
                    onPress={goToNext}
                    disabled={loading || refreshing}
                    style={tw("flex-1 ml-2")}
                    appearance="outline"
                >
                    Sau
                </Button>
            </View>


            <ElementCommentSection elementId={Number(elementId) ?? 1} />
        </ScrollView>
    );
};

export default DetailElementScreen;

//------------------------------------------------------
// Child Components
//------------------------------------------------------

const defaultNA = "Không có"; // Default value for missing data - Translated

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

//----------------------------------
// ElementInfoCard Component
//----------------------------------
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

//----------------------------------
// ElementCommentSection Component
//----------------------------------
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
            // Assuming CommentsEmptyState contains its own text, will need translation there if applicable
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
                scrollEnabled={false}
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
                contentContainerStyle={tailwind('pb-20')}
            />


            <View style={tailwind('absolute bottom-0 left-0 right-0 px-2 pb-2 bg-gray-900/100')}>

                <CommentInput onSubmit={handleCommentSubmit} />
            </View>
        </View>
    )
}

//----------------------------------
// ElementHeader Component
//----------------------------------
interface ElementHeaderProps {
    element: DetailElement_t;
}

const ElementHeader: React.FC<ElementHeaderProps> = ({ element }) => {
    const tw = useTailwind();

    return (
        <LinearGradient
            colors={['#7C3AEDFF', '#4F46E5FF']} // from-purple-600 to-indigo-600
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[tw("m-4 p-5 rounded-lg"), CustomStyles.shadow]}
        >
            <View style={tw("flex-row justify-between items-center")}>
                <View style={tw("flex-shrink pr-4")}>

                    <Text style={tw("text-4xl font-bold text-white/100")}>
                        {element.symbol}
                    </Text>
                    <View>
                        <Text category="h5" style={tw("text-white/100 font-semibold mt-1")}>{element.name}</Text>
                        <Text category="s1" style={tw("text-purple-200/100 mt-1")}>Số hiệu nguyên tử: {element.atomicNumber}</Text>
                    </View>
                </View>


                {element.image ? (
                    <Image
                        source={{ uri: element.image }}
                        style={tw("w-24 h-24 rounded-lg border-2 border-white/100 bg-white/20")} // Added background/border
                        resizeMode="contain"
                    />
                ) : (
                    // Placeholder if no image
                    <View style={tw("w-24 h-24 rounded-lg border-2 border-white/100 bg-white/20 justify-center items-center")}>
                        <Text style={tw("text-white/50")}>Không có hình ảnh</Text>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
};

//----------------------------------
// ElementClassification Component
//----------------------------------
interface ElementClassificationProps {
    element: DetailElement_t;
}

const ElementClassification: React.FC<ElementClassificationProps> = ({ element }) => {
    const classificationProperties: PropertyPair[] = [
        { label: "Phân loại", value: element.classification }, // Translated label
        { label: "Nhóm", value: element.groupNumber },        // Translated label
        { label: "Chu kỳ", value: element.period },          // Translated label
        { label: "Khối", value: element.block },             // Translated label
    ];

    return <ElementInfoCard title="Phân loại" properties={classificationProperties} />; // Translated title
};

//----------------------------------
// ElementPhysicalProps Component
//----------------------------------
interface ElementPhysicalPropsProps {
    element: DetailElement_t;
}

const ElementPhysicalProps: React.FC<ElementPhysicalPropsProps> = ({ element }) => {
    const physicalProperties: PropertyPair[] = [
        { label: "Khối lượng nguyên tử", value: element.atomicMass, unit: "u" }, // Translated label
        { label: "Điểm nóng chảy", value: element.meltingPoint, unit: "K" },      // Translated label
        { label: "Điểm sôi", value: element.boilingPoint, unit: "K" },          // Translated label
        { label: "Tỷ trọng", value: element.density, unit: "g/cm³" },         // Translated label
        { label: "Trạng thái tiêu chuẩn", value: element.standardState },   // Translated label
    ];

    return <ElementInfoCard title="Tính chất vật lý" properties={physicalProperties} />; // Translated title
};

//----------------------------------
// ElementElectronicProps Component
//----------------------------------
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
        { label: "Cấu hình", value: element.electronicConfiguration },           // Translated label
        { label: "Độ âm điện", value: element.electronegativity },                // Translated label
        { label: "Năng lượng ion hóa", value: element.ionizationEnergy, unit: "eV" },// Translated label
        { label: "Ái lực electron", value: element.electronAffinity, unit: "eV" }, // Translated label
        { label: "Số oxi hóa", value: renderOxidationStates(element.oxidationStates) }, // Translated label
    ];

    return <ElementInfoCard title="Tính chất electron" properties={electronicProperties} />; // Translated title
};

//----------------------------------
// ElementAtomicProps Component
//----------------------------------
interface ElementAtomicPropsProps {
    element: DetailElement_t;
}

const ElementAtomicProps: React.FC<ElementAtomicPropsProps> = ({ element }) => {
    const atomicProperties: PropertyPair[] = [
        { label: "Bán kính nguyên tử", value: element.atomicRadius, unit: "pm" },     // Translated label
        { label: "Bán kính ion", value: element.ionRadius, unit: "pm" },          // Translated label
        { label: "Bán kính Van der Waals", value: element.vanDelWaalsRadius, unit: "pm" }, // Translated label
    ];

    return <ElementInfoCard title="Kích thước nguyên tử" properties={atomicProperties} />; // Translated title
};

//----------------------------------
// ElementOtherInfo Component
//----------------------------------
interface ElementOtherInfoProps {
    element: DetailElement_t;
}

const ElementOtherInfo: React.FC<ElementOtherInfoProps> = ({ element }) => {
    const otherProperties: PropertyPair[] = [
        { label: "Kiểu liên kết", value: element.bondingType },    // Translated label
        { label: "Năm phát hiện", value: element.yearDiscovered }, // Translated label
    ];

    return <ElementInfoCard title="Thông tin khác" properties={otherProperties} />; // Translated title
};

//------------------------------------------------------
// StyleSheet
//------------------------------------------------------
const styles = StyleSheet.create({
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});