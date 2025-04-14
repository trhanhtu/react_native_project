import { Text } from "@ui-kitten/components";
import React from "react";
import { ActivityIndicator, ColorValue, View } from "react-native";
import { CommentsHeaderProps } from "../utils/types";

export const CommentsHeader: React.FC<CommentsHeaderProps> = ({ tailwind, isCommentsLoading, commentsError }) => (
    <View style={tailwind('pb-2')}>
        {isCommentsLoading && (
            <View style={tailwind('py-6 items-center w-full')}>
                <ActivityIndicator size="small" color={tailwind('text-purple-400/100').color as ColorValue} />
                <Text style={tailwind('text-gray-400/100 mt-2')}>Đang tải bình luận...</Text>
            </View>
        )}

        {commentsError && !isCommentsLoading && (
            <View style={tailwind('bg-red-900/100 rounded-lg p-3 mt-3')}>
                <Text style={tailwind('text-red-300/100 text-center')}>
                    Lỗi tải bình luận: {commentsError}
                </Text>
            </View>
        )}
    </View>
);