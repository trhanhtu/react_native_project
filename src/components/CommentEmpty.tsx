import { Ionicons } from "@expo/vector-icons";
import { Text } from "@ui-kitten/components";
import { ColorValue, TouchableOpacity, View } from "react-native";
import { Style } from "tailwind-rn";
import CustomStyles from "../utils/styles";
interface CommentsEmptyStateProps {
    tailwind: (_className: string) => Style;
}
const CommentsEmptyState = ({ tailwind }: CommentsEmptyStateProps) => (
    <View style={[tailwind('items-center py-8 px-4 bg-gray-800/100 rounded-xl mt-2'), CustomStyles.shadow]}>
        <Ionicons name="chatbubbles-outline" size={40} color={tailwind('text-gray-500/100').color as ColorValue} />
        <Text style={tailwind('text-gray-400/100 text-center mt-3')}>Chưa có bình luận nào.</Text>
        <TouchableOpacity style={tailwind('mt-4 bg-purple-600/100 px-5 py-2 rounded-full')}>
            <Text style={tailwind('text-white/100')}>Thêm bình luận đầu tiên</Text>
        </TouchableOpacity>
    </View>
);
export default CommentsEmptyState;