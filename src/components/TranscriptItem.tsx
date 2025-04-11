import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ColorValue, ScrollView, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface Props {
    transcript: string;
}

const TranscriptItem: React.FC<Props> = ({ transcript }) => {
    const tailwind = useTailwind();

    // Split transcript into paragraphs for better readability
    const paragraphs = transcript.split('\n').filter(p => p.trim().length > 0);

    return (
        <ScrollView style={[
            tailwind('p-4 bg-gray-800/100 rounded-xl mb-4'),
            CustomStyles.shadow
        ]}>
            <View style={tailwind('flex-row items-center mb-3')}>
                <Ionicons name="document-text" size={20} color={tailwind('text-purple-400/100').color as ColorValue} />
                <Text style={tailwind('text-white/100 font-bold ml-2')}>Lời thoại</Text>
            </View>

            {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                    <View key={index} style={tailwind('mb-3')}>
                        <Text style={tailwind('text-gray-300/100 leading-6')}>
                            {paragraph}
                        </Text>
                    </View>
                ))
            ) : (
                <Text style={tailwind('text-gray-400/100 italic')}>
                    {transcript}
                </Text>
            )}

            <View style={tailwind('mt-2 pt-2 border-t border-gray-700/100')}>
                <Text style={tailwind('text-gray-500/100 text-xs')}>
                    Lời thoại được tạo tự động và có thể không chính xác 100%.
                </Text>
            </View>
        </ScrollView>
    );
};

const CustomStyles = {
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    }
};

export default TranscriptItem;