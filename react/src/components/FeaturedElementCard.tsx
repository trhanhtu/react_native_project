import { Card, Text } from "@ui-kitten/components"
import type React from "react"
import { Pressable, View } from "react-native"
import { useTailwind } from "tailwind-rn"
import { DetailElement_t } from "../utils/types"


interface FeaturedElementCardProps {
    element: DetailElement_t | null
    onPress: () => void
    isLoading?: boolean
    error?: string | null
}

// Component hiển thị thông tin nguyên tố nổi bật
const FeaturedElementCard: React.FC<FeaturedElementCardProps> = ({
    element,
    onPress,
    isLoading = false,
    error = null,
}) => {
    const tw = useTailwind()

    // Hiển thị trạng thái loading
    if (isLoading) {
        return (
            <Card style={tw("mb-6 bg-white/100")}>
                <View style={tw("h-32 items-center justify-center")}>
                    <Text>Đang tải nguyên tố nổi bật...</Text>
                </View>
            </Card>
        )
    }

    // Hiển thị thông báo lỗi
    if (error || !element) {
        return (
            <Card style={tw("mb-6 bg-white/100")}>
                <View style={tw("h-32 items-center justify-center")}>
                    <Text status="danger">{error || "Không thể tải nguyên tố"}</Text>
                </View>
            </Card>
        )
    }

    // Xác định màu nền dựa trên phân loại nguyên tố
    const getBackgroundColor = (classification: string) => {
        switch (classification.toLowerCase()) {
            case "kim loại":
                return "bg-blue-100/100"
            case "phi kim":
                return "bg-green-100/100"
            case "trung tính":
                return "bg-yellow-100/100"
            default:
                return "bg-gray-100/100"
        }
    }

    return (
        <Card style={tw(`mb-6 ${getBackgroundColor(element.classification)}`)}>
            <Pressable onPress={onPress} >
                <View style={tw("flex-row")}>
                    <View style={tw("w-1/3 items-center justify-center")}>
                        <View style={tw("w-20 h-20 rounded-full bg-white/100 items-center justify-center border-2 border-purple-300/100")}>
                            <Text category="h1" style={tw("font-bold text-purple-600/100")}>
                                {element.symbol}
                            </Text>
                        </View>
                        <Text category="s1" style={tw("mt-2 text-center")}>
                            {element.atomicNumber}
                        </Text>
                    </View>

                    <View style={tw("w-2/3 pl-4")}>
                        <Text category="h5" style={tw("font-bold mb-1")}>
                            {element.name}
                        </Text>

                        <View style={tw("flex-row mb-1")}>
                            <Text category="s2" style={tw("text-gray-600/100 w-1/2")}>
                                Khối lượng:
                            </Text>
                            <Text category="s2" style={tw("w-1/2")}>
                                {element.atomicMass}
                            </Text>
                        </View>

                        <View style={tw("flex-row mb-1")}>
                            <Text category="s2" style={tw("text-gray-600/100 w-1/2")}>
                                Phân loại:
                            </Text>
                            <Text category="s2" style={tw("w-1/2")}>
                                {element.classification}
                            </Text>
                        </View>

                        <View style={tw("flex-row mb-1")}>
                            <Text category="s2" style={tw("text-gray-600/100 w-1/2")}>
                                Chu kỳ/Nhóm:
                            </Text>
                            <Text category="s2" style={tw("w-1/2")}>
                                {element.period}/{element.groupNumber}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Card>
    )
}

export default FeaturedElementCard

