import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, ColorValue, Image, Keyboard, TextInput, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import GlobalStorage from '../utils/GlobalStorage';

interface Props {
    userAvatar?: string;
    onSubmit: (text: string) => Promise<void>;
    placeholder?: string;
    isSubmitting?: boolean;
}

const CommentInput: React.FC<Props> = ({
    userAvatar = GlobalStorage.getItem("avatar") ?? `https://i.pravatar.cc/40?u=${encodeURIComponent(GlobalStorage.getItem("name") ?? "")}`,
    onSubmit,
    placeholder = 'Thêm bình luận của bạn...',
    isSubmitting = false
}) => {
    const tailwind = useTailwind();
    const [comment, setComment] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = async () => {
        if (comment.trim() && !isSubmitting) {
            Keyboard.dismiss();
            try {
                await onSubmit(comment);
                setComment(''); // Clear input after successful submission
            } catch (error) {
                // Error handling would be done in the parent component
                console.log('Error submitting comment:', error);
            }
        }
    };

    return (
        <View style={[
            tailwind('p-3 bg-gray-800/100 rounded-xl mb-2'),
            CustomStyles.shadow,
            isFocused ? tailwind('border border-purple-500/100') : tailwind('border border-transparent')
        ]}>
            <View style={tailwind('flex-row items-center')}>
                {/* User Avatar */}
                <LinearGradient
                    colors={['#A855F7', '#3B82F6']}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={tailwind('rounded-full p-0.5')}
                >
                    <Image
                        source={{ uri: userAvatar }}
                        style={tailwind('w-8 h-8 rounded-full')}
                    />
                </LinearGradient>

                {/* Text Input */}
                <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    style={tailwind('flex-1 ml-3 text-white/100 py-2 px-3 bg-gray-700/100 rounded-full')}
                    multiline={false}
                    maxLength={500}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!comment.trim() || isSubmitting}
                    style={[
                        tailwind('ml-2 w-10 h-10 rounded-full items-center justify-center'),
                        comment.trim() && !isSubmitting
                            ? tailwind('bg-purple-600/100')
                            : tailwind('bg-gray-700/100')
                    ]}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color={tailwind('text-white/100').color as ColorValue} />
                    ) : (
                        <Ionicons
                            name="send"
                            size={18}
                            color={comment.trim() ? '#ffffff' : tailwind('text-gray-500/100').color as ColorValue}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
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

export default CommentInput;