import { Card, Text } from "@ui-kitten/components"
import { View } from "react-native"
import { useTailwind } from "tailwind-rn"
import { Classification_t, DetailElement_t, } from "../utils/types"


interface ElementCardProps {
    element: DetailElement_t
    onPress?: (element: DetailElement_t) => void,
    keyword: string
}

export default function ElementCard({ element, onPress, keyword }: ElementCardProps) {
    const tw = useTailwind()

    const getCategoryColor = (classification: Classification_t) => {
        const categoryColors = {
            "kim loại": "bg-blue-500/100",
            "phi kim": "bg-green-500/100",
            "trung tính": "bg-yellow-500/100",
            "-": "bg-gray-400/100",
        }

        return categoryColors[classification] || "bg-gray-400/100"
    }

    const handlePress = () => {
        if (onPress) {
            onPress(element)
        }
    }

    return (
        <Card style={tw("mb-3 overflow-hidden")} onPress={handlePress} disabled={!onPress}>
            <View style={tw("flex-row")}>
                <View style={tw(`${getCategoryColor(element.classification)} w-16 h-16 items-center justify-center rounded-l`)}>
                    <Text category="h6" style={tw("text-white font-bold")}>
                        {element.symbol}
                    </Text>
                    <Text category="c2" style={tw("text-white")}>
                        {element.atomicNumber}
                    </Text>
                </View>

                <View style={tw("flex-1 p-3")}>
                    <Text category="s1">{element.name}</Text>
                    <Text category="p2" appearance="hint">
                        {element.classification}
                    </Text>
                    <Text category="c1">Khối lượng nguyên tử: {element.atomicMass}</Text>
                    <Text category="c1">
                        Nhóm: {element.groupNumber}, Chu kỳ: {element.period}
                    </Text>
                </View>
            </View>
        </Card>
    )
}

