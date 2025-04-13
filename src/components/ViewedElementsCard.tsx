// ViewedElementsCard.tsx
import CustomStyles from "@/src/utils/styles";
// MISSING: The parent component (profile.tsx) needs to provide an array of elements
// where each object includes the `atomicNumber: number` field, which is missing from the base `ViewedElement_t`.
// This component assumes `viewedElements` is `AugmentedViewedElement[]` (defined in profile.tsx or types.ts).
// type AugmentedViewedElement = ViewedElement_t & { atomicNumber: number };
import { ViewedElement_t } from "@/src/utils/types"; // Corrected path
import { Button, Card, Text } from '@ui-kitten/components';
import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import ElementItem from './ElementItem'; // Assuming ElementItem expects `atomicNumber: number`

// Assume Augmented type is passed from parent
type AugmentedViewedElement = ViewedElement_t & { atomicNumber: number };


interface ViewedElementsCardProps {
    viewedElements: ViewedElement_t[], // Use augmented type
    hasMore: boolean,
    loadingMore: boolean,
    onLoadMore: () => void,
    onPressElement: (atomicNumber: number) => void, // atomicNumber is number
}

const ViewedElementsCard: React.FC<ViewedElementsCardProps> = ({
    viewedElements,
    hasMore,
    loadingMore,
    onLoadMore,
    onPressElement,
}) => {
    const tw = useTailwind()
    return (
        <Card style={[tw("mb-6 rounded-xl bg-white/100"), CustomStyles.shadow]}>
            <View style={tw("p-4")}>
                <Text style={tw("text-lg font-bold text-gray-800/100 mb-4")}>Recently Viewed Elements</Text>
                {viewedElements && viewedElements.length > 0 ? (
                    <View>
                        {/* Horizontal ScrollView for Element Items */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw("py-1")}>
                            
                            {viewedElements.map((item) => (
                                <View key={item.elementName} style={tw("mr-4")}>
                                    <ElementItem
                                        // Pass necessary props to ElementItem
                                        // It likely needs symbol, elementName, image, atomicNumber etc.
                                        item={{
                                            atomicNumber: item.elementId,
                                            symbol: item.symbol,
                                            elementName: item.elementName,
                                            image: item.image,
                                            // Add other fields ElementItem expects
                                        }}
                                        isFavorite={false} // Viewed items are not necessarily favorite
                                        onPress={() => onPressElement(item.elementId)} // Pass number ID
                                        lastSeen={item.lastSeen} // Pass lastSeen if ElementItem uses it
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        {hasMore && (
                            <Button
                                onPress={onLoadMore}
                                style={tw("mt-4 bg-gray-200/100 border-0")} // Adjusted color
                                appearance='ghost'
                                status='basic'
                                disabled={loadingMore}
                                accessoryLeft={
                                    loadingMore ? () => <ActivityIndicator size="small" color="#8B5CF6" /> : undefined
                                }
                            >
                                {loadingMore ? "Loading..." : "Load More"}
                            </Button>
                        )}
                    </View>
                ) : (
                    <Text style={tw("text-gray-500/100 italic text-center py-4")}>No viewed elements yet</Text>
                )}
            </View>
        </Card>
    )
}

export default ViewedElementsCard