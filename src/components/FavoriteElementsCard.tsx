import CustomStyles from "@/src/utils/styles"
import { Card, Text } from '@ui-kitten/components'
import React from 'react'
import { ScrollView, View } from 'react-native'
import { useTailwind } from 'tailwind-rn'
import ElementItem from './ElementItem'

interface FavoriteElementsCardProps {
    favoriteElements: any[], // array of FavoriteElement_t; update type as needed
    onPressElement: (atomicNumber: string) => void,
}

const FavoriteElementsCard: React.FC<FavoriteElementsCardProps> = ({ favoriteElements, onPressElement }) => {
    const tw = useTailwind()
    return (
        <Card style={[tw("mb-6 rounded-xl"), CustomStyles.shadow]}>
            <View style={tw("p-4")}>
                <Text style={tw("text-lg font-bold text-gray-800 mb-4")}>Favorite Elements</Text>
                {favoriteElements && favoriteElements.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {favoriteElements.map((fav) => (
                            <View key={fav.element.atomicNumber}>
                                <ElementItem
                                    item={fav.element}
                                    onPress={() => onPressElement(fav.element.atomicNumber.toString())}
                                />
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={tw("text-gray-500 italic")}>No favorite elements yet</Text>
                )}
            </View>
        </Card>
    )
}

export default FavoriteElementsCard
