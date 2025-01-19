import useProfile from "@/src/components/hooks/useProfile";
import { Button, Layout } from "@ui-kitten/components";
import { useTailwind } from "tailwind-rn";

export default function ProfileScreen() {
    const tailwind = useTailwind();
    const {
        handleExitAccount,
    } = useProfile();
    return (
        <Layout style={tailwind("flex-1 bg-white")}>
            <Button status="danger" appearance="outline" onPress={handleExitAccount}>Thoát</Button>
        </Layout>
    )
}


