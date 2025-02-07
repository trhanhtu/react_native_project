import authCheck from "@/src/utils/authCheck";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTailwind } from "tailwind-rn";
export default function Index() {

  const tailwind = useTailwind();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true); // Set to true after the component has mounted
  }, []);

  useEffect(() => {
    if (isMounted) {
      // Perform navigation after the component has mounted and layout context is ready
      authCheck.isLoggedIn().then((isLoginBefore) => {
        if (isLoginBefore) {
          router.replace("/(usertabs)/profile");
        } else {
          router.replace("/onboard");

        }
      })
    }
  }, [isMounted, router]);

  return (
    <View style={tailwind("items-center flex-1 justify-center")}>
      <Text>Đang chuyển Trang</Text>
    </View>
  );
};
