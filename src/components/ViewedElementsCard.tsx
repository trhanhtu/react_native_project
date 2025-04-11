import CustomStyles from "@/src/utils/styles"
import { Button, Card, Text } from '@ui-kitten/components'
import React from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useTailwind } from 'tailwind-rn'
import { ViewedElement_t } from "../utils/types"
import ElementItem from './ElementItem'

interface ViewedElementsCardProps {
    viewedElements: ViewedElement_t[], // array of ViewedElement_t; update type as needed
    hasMore: boolean,
    loadingMore: boolean,
    onLoadMore: () => void,
    onPressElement: (atomicNumber: string) => void,
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
        <Card style={[tw("mb-6 rounded-xl"), CustomStyles.shadow]}>
            <View style={tw("p-4")}>
                <Text style={tw("text-lg font-bold text-gray-800/100 mb-4")}>Recently Viewed Elements</Text>
                {viewedElements && viewedElements.length > 0 ? (
                    <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {viewedElements.map((item) => (
                                <View key={`${item.element.atomicNumber}_${item.lastSeen}`} style={tw("mr-4")}>
                                    <ElementItem
                                        item={item.element}
                                        isFavorite={false}
                                        onPress={() => onPressElement(item.element.atomicNumber.toString())}
                                        lastSeen={item.lastSeen}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        {hasMore && (
                            <Button
                                onPress={onLoadMore}
                                style={tw("mt-4 bg-gray-200/100 border-0")}
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
                    <Text style={tw("text-gray-500/100 italic")}>No viewed elements yet</Text>
                )}
            </View>
        </Card>
    )
}

export default ViewedElementsCard
