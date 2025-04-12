import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ColorValue, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { PodcastComment } from '../utils/types';

interface Props {
    comment: PodcastComment;
    onLikeComment: (commentId: number) => void,
    loadingLikeCommentId: number
}

const CommentItem: React.FC<Props> = ({ comment, loadingLikeCommentId, onLikeComment }) => {
    const tailwind = useTailwind();

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return dateString;
        }
    };

    const avatarUrl = comment.userAvatar || `https://i.pravatar.cc/40?u=${encodeURIComponent(comment.userName)}`;

    return (
        <View style={[
            tailwind('flex-row items-start p-3 bg-gray-800/100 rounded-xl'),
            CustomStyles.shadow
        ]}>
            <LinearGradient
                // Define your gradient colors matching purple to blue
                colors={['#A855F7', '#3B82F6']}
                start={[0, 0]}
                end={[1, 0]}
                // Apply tailwind classes for rounded corners and padding
                style={tailwind('rounded-full p-0.5')}
            >
                <Image
                    source={{ uri: avatarUrl }}
                    style={tailwind('w-10 h-10 rounded-full')}
                />
            </LinearGradient>

            {/* Comment content */}
            <View style={tailwind('flex-1 ml-3')}>
                <View style={tailwind('flex-row items-center')}>
                    <Text style={tailwind('text-white/100 font-bold')}>{comment.userName || 'Người dùng ẩn danh'}</Text>
                    <View style={tailwind('ml-2 px-2 py-0.5 bg-purple-900/100 rounded-full')}>
                        <Text style={tailwind('text-purple-300/100 text-xs')}>Fan</Text>
                    </View>
                </View>

                <Text style={tailwind('text-gray-300/100 mt-1 leading-5')}>{comment.content}</Text>

                <View style={tailwind('flex-row justify-between items-center mt-2')}>
                    <Text style={tailwind('text-gray-500/100 text-xs')}>
                        {formatDate(comment.createdAt)}
                    </Text>

                    <View style={tailwind('flex-row')}>
                        <TouchableOpacity disabled={comment.id === loadingLikeCommentId} style={tailwind('flex-row items-center mr-4')} onPress={() => onLikeComment(comment.id)}>
                            <Ionicons name="heart-outline" size={16} color={tailwind('text-gray-400/100').color as ColorValue} />
                            <Text style={tailwind('text-gray-400/100 text-xs ml-1')}>{comment.likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={tailwind('flex-row items-center')}>
                            <Ionicons name="chatbubble-outline" size={14} color={tailwind('text-gray-400/100').color as ColorValue} />
                            <Text style={tailwind('text-gray-400/100 text-xs ml-1')}>Trả lời</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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

export default CommentItem;