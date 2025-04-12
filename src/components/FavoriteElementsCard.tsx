// FavoriteElementsCard.tsx
import CustomStyles from "@/src/utils/styles";
// MISSING: Similar to ViewedElementsCard, needs augmented data with `atomicNumber: number`.
// Assumes `favoriteElements` is `AugmentedFavoriteElement[]`.
// type AugmentedFavoriteElement = FavoriteElement_t & { atomicNumber: number };
import { FavoriteElement_t } from "@/src/utils/types"; // Corrected path
import { Card, Text } from '@ui-kitten/components';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import ElementItem from './ElementItem'; // Assuming ElementItem expects `atomicNumber: number`

// Assume Augmented type is passed from parent
type AugmentedFavoriteElement = FavoriteElement_t & { atomicNumber: number };

interface FavoriteElementsCardProps {
    favoriteElements: FavoriteElement_t[], // Use augmented type
    onPressElement: (atomicNumber: number) => void, // atomicNumber is number
}

const FavoriteElementsCard: React.FC<FavoriteElementsCardProps> = ({ favoriteElements, onPressElement }) => {
    const tw = useTailwind()
    return (
        <Card style={[tw("mb-6 rounded-xl bg-white/100"), CustomStyles.shadow]}>
            <View style={tw("p-4")}>
                <Text style={tw("text-lg font-bold text-gray-800/100 mb-4")}>Favorite Elements</Text>
                {favoriteElements && favoriteElements.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw("py-1")}>
                        {/* Use atomicNumber (number) as key */}
                        {favoriteElements.map((fav) => (
                            <View key={`favele${fav.id}`} style={tw("mr-4")}>
                                <ElementItem
                                    // Pass necessary props to ElementItem
                                    item={{
                                        atomicNumber: fav.id,
                                        symbol: fav.symbol,
                                        elementName: fav.elementName,
                                        image: fav.image,
                                        // Add other fields ElementItem expects
                                    }}
                                    isFavorite={true} // These are favorites
                                    onPress={() => onPressElement(fav.id)} // Pass number ID
                                />
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={tw("text-gray-500/100 italic text-center py-4")}>No favorite elements yet</Text>
                )}
            </View>
        </Card>
    )
}

export default FavoriteElementsCard