import { Layout, Text } from "@ui-kitten/components";
import { useTailwind } from "tailwind-rn";

export default function HistoryScreen() {
    const tailwind = useTailwind();
    return (
        <Layout style={tailwind("flex-1 bg-red-500/100")}>
            <Text>Làm sao history</Text>
        </Layout>
    )
}