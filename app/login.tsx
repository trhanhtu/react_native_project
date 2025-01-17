import { View } from "react-native";
import { useTailwind } from "tailwind-rn";

export default function LoginScreen() {
    const tailwind = useTailwind();
    return (
        <View style={tailwind("flex-1")}>

        </View>
    )
}