import { fetchElementDetails } from "@/api/api"
import { DetailElement_t } from "@/src/utils/types"
import { Button, Card, Divider, Text } from "@ui-kitten/components"
import { Href, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Image, ScrollView, View } from "react-native"
import { useTailwind } from "tailwind-rn"

const DetailElementScreen = () => {
    const { elementId } = useLocalSearchParams()
    const tw = useTailwind()
    const { element, loading, error, goToPrevious, goToNext, goToPreviousDisabled } = useElementDetails(Number(elementId))

    if (loading) {
        return (
            <View style={tw("flex-1 justify-center items-center")}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={tw("mt-4")}>Đang tải thông tin nguyên tố...</Text>
            </View>
        )
    }

    if (error || !element) {
        return (
            <View style={tw("flex-1 justify-center items-center p-4")}>
                <Text category="h5" style={tw("text-red-500 text-center")}>
                    {error || "Không tìm thấy thông tin nguyên tố"}
                </Text>
            </View>
        )
    }

    return (
        <ScrollView style={tw("flex-1 bg-gray-100")} showsVerticalScrollIndicator={false}>
            <ElementHeader element={element} />
            <ElementClassification element={element} />
            <ElementPhysicalProps element={element} />
            <ElementElectronicProps element={element} />
            <ElementAtomicProps element={element} />
            <ElementOtherInfo element={element} />
            {/* Next & Previous Buttons */}
            <View style={tw("flex-row justify-between p-4")}>
                <Button onPress={goToPrevious} disabled={goToPreviousDisabled} style={tw("flex-1 mr-2")}>
                    Previous
                </Button>
                <Button onPress={goToNext} style={tw("flex-1 ml-2")}>
                    Next
                </Button>
            </View>
        </ScrollView>
    )
}

export default DetailElementScreen



interface ElementPhysicalPropsProps {
    element: DetailElement_t
}

// Component hiển thị đặc tính vật lý của nguyên tố
const ElementPhysicalProps: React.FC<ElementPhysicalPropsProps> = ({ element }) => {
    const tw = useTailwind()

    const physicalProperties = [
        { label: "Khối lượng nguyên tử", value: element.atomicMass },
        { label: "Điểm nóng chảy", value: `${element.meltingPoint} K` },
        { label: "Điểm sôi", value: `${element.boilingPoint} K` },
        { label: "Mật độ", value: `${element.density} g/cm³` },
        { label: "Trạng thái tiêu chuẩn", value: element.standardState },
    ]

    return <ElementInfoCard title="Đặc tính vật lý" properties={physicalProperties} />
}

interface ElementOtherInfoProps {
    element: DetailElement_t
}

// Component hiển thị thông tin khác của nguyên tố
const ElementOtherInfo: React.FC<ElementOtherInfoProps> = ({ element }) => {
    const tw = useTailwind()

    const otherProperties = [
        { label: "Loại liên kết", value: element.bondingType },
        { label: "Năm phát hiện", value: element.yearDiscovered },
    ]

    return <ElementInfoCard title="Thông tin khác" properties={otherProperties} />
}


type PropertyPair = {
    label: string
    value: string | number | React.ReactNode
}
interface ElementInfoCardProps {
    title: string
    properties: PropertyPair[]
}

// Component tái sử dụng để hiển thị các thông tin nguyên tố theo nhóm
const ElementInfoCard: React.FC<ElementInfoCardProps> = ({ title, properties }) => {
    const tw = useTailwind()

    return (
        <Card style={tw("m-4")}>
            <Text category="h6" style={tw("mb-2 font-bold")}>
                {title}
            </Text>
            <Divider style={tw("mb-2")} />

            {properties.map((prop, index) => (
                <View key={index} style={tw("flex-row justify-between mb-2")}>
                    <Text>{prop.label}:</Text>
                    <Text>{prop.value as string}</Text>
                </View>
            ))}
        </Card>
    )
}


interface ElementHeaderProps {
    element: DetailElement_t
}

// Component hiển thị thông tin cơ bản của nguyên tố ở phần đầu
const ElementHeader: React.FC<ElementHeaderProps> = ({ element }) => {
    const tw = useTailwind()

    return (
        <Card style={tw("m-4")}>
            <View style={tw("flex-row justify-between items-center")}>
                <View>
                    <Text category="h1" style={tw("text-3xl font-bold")}>
                        {element.symbol}
                    </Text>
                    <Text category="h5">{element.name}</Text>
                    <Text category="s1">Số nguyên tử: {element.atomicNumber}</Text>
                </View>

                {/* Hiển thị hình ảnh nguyên tố nếu có */}
                {element.image && (
                    <Image source={{ uri: element.image }} style={tw("w-24 h-24 rounded-lg")} resizeMode="contain" />
                )}
            </View>
        </Card>
    )
}

interface ElementElectronicPropsProps {
    element: DetailElement_t
}

// Component hiển thị đặc tính điện tử của nguyên tố
const ElementElectronicProps: React.FC<ElementElectronicPropsProps> = ({ element }) => {
    const tw = useTailwind()

    // Hàm để hiển thị mảng trạng thái oxi hóa
    const renderOxidationStates = (states: number[]) => {
        return states.join(", ")
    }

    const electronicProperties = [
        { label: "Cấu hình điện tử", value: element.electronicConfiguration },
        { label: "Độ âm điện", value: element.electronegativity },
        { label: "Năng lượng ion hóa", value: `${element.ionizationEnergy} eV` },
        { label: "Ái lực điện tử", value: `${element.electronAffinity} eV` },
        { label: "Trạng thái oxi hóa", value: renderOxidationStates(element.oxidationStates) },
    ]

    return <ElementInfoCard title="Đặc tính điện tử" properties={electronicProperties} />
}

interface ElementClassificationProps {
    element: DetailElement_t
}

// Component hiển thị thông tin phân loại của nguyên tố
const ElementClassification: React.FC<ElementClassificationProps> = ({ element }) => {
    const tw = useTailwind()

    const classificationProperties = [
        { label: "Phân loại", value: element.classification },
        { label: "Nhóm", value: element.groupNumber },
        { label: "Chu kỳ", value: element.period },
        { label: "Khối", value: element.block },
    ]

    return <ElementInfoCard title="Phân loại" properties={classificationProperties} />
}


interface ElementAtomicPropsProps {
    element: DetailElement_t
}

// Component hiển thị kích thước nguyên tử
const ElementAtomicProps: React.FC<ElementAtomicPropsProps> = ({ element }) => {
    const tw = useTailwind()

    const atomicProperties = [
        { label: "Bán kính nguyên tử", value: `${element.atomicRadius} pm` },
        { label: "Bán kính ion", value: `${element.ionRadius} pm` },
        { label: "Bán kính Van der Waals", value: `${element.vanDelWaalsRadius} pm` },
    ]

    return <ElementInfoCard title="Kích thước nguyên tử" properties={atomicProperties} />
}

// Custom hook để lấy thông tin chi tiết của nguyên tố
const useElementDetails = (elementId: number) => {
    const [element, setElement] = useState<DetailElement_t | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            const data = await fetchElementDetails(elementId)

            if (data) {
                setElement(data)
                setError(null)
            } else {
                setError("Không thể lấy dữ liệu nguyên tố")
            }

            setLoading(false)
        }

        loadData()
    }, [elementId])
    const goToPrevious = () => {
        if (elementId > 1) {
            router.replace(`/detailelement/${elementId - 1}` as Href)
        }

    }

    const goToNext = () => {
        router.push(`/detailelement/${elementId + 1}` as Href)
    }
    return { element, loading, error, goToPrevious, goToNext, goToPreviousDisabled: elementId <= 1 }
}

