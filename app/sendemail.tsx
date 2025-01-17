import SquareImage from "@/src/components/SquareImage";
import { Button, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn";


export default function SendEmailScreen() {
    const tailwind = useTailwind()
    const router = useRouter()
    return (
        <View
            style={tailwind("flex-1 items-center bg-white/100")}
        >
            <SquareImage
                percent={0.7}
                src={require("../assets/images/wait_for_email.png")}
                customStyle={[tailwind("mt-15p rounded-xl"), { backgroundColor: "#07A9F0" },]}
            />

            <Text category='h5' style={tailwind("pointer-events-none my-10")}>
                Hãy kiểm tra email của bạn
            </Text>
            <Text style={tailwind("text-center px-5")}>
                Chúng tôi đã gửi 1 email xác nhận tới địa chỉ của bạn. Hãy hoàn tất quá trình đăng ký với chúng tôi.
            </Text>
            <View style={tailwind("flex flex-row flex-1 w-full justify-center items-end")}>
                <Button style={tailwind("mb-5 w-70p")} onPress={() => router.replace("/login")}>Tôi đã hiểu</Button>
            </View>
        </View>
    )
}