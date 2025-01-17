import SquareImage from "@/src/components/SquareImage";
import { Button, Layout, Text, ViewPager } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { Fragment, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Style, useTailwind } from "tailwind-rn";
import Parallelogram from "../assets/svgs/parallelogram.svg";
export default function OnboardScreen() {
    const tailwind = useTailwind();
    const router = useRouter();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const shouldLoadComponent = (index: number): boolean => index === selectedIndex;
    // Layout effect to update image size on mount and dimension change
    return (
        <Fragment>

            <ViewPager
                style={tailwind("flex-1")}
                selectedIndex={selectedIndex}
                shouldLoadComponent={shouldLoadComponent}
                onSelect={index => setSelectedIndex(index)}
            >
                {/*--[tab 0]--------------------------------------------------------------------*/}
                <Layout
                    style={tailwind("flex-1 items-center ")}
                >
                    <SquareImage
                        percent={0.7}
                        src={require("../assets/images/onboard_1.png")}
                        customStyle={tailwind("bg-green-600/100 mt-15p rounded-xl")}
                    />

                    <Text category='h5' style={tailwind("pointer-events-none my-10 text-center")}>
                        Chào mừng đến với Thế Giới Nguyên Tố
                    </Text>
                    <Text style={tailwind("text-center px-7")}>
                        Khám phá các nguyên tố và đặc tính của chúng trong bảng tuần hoàn tương tác này.  Vuốt để tìm hiểu cách điều hướng và sử dụng ứng dụng!
                    </Text>
                
                </Layout>
                {/*--[tab 1]--------------------------------------------------------------------*/}

                <Layout
                    style={tailwind("flex-1 items-center ")}
                >
                    <SquareImage
                        percent={0.7}
                        src={require("../assets/images/onboard_2.png")}
                        customStyle={tailwind("bg-yellow-300/100 mt-15p rounded-xl")}
                    />

                    <Text category='h5' style={tailwind("pointer-events-none my-10")}>
                        Khám phá các nguyên tố
                    </Text>
                    <Text style={tailwind("px-7 text-center")}>
                        Vuốt qua các nguyên tố để tìm hiểu về số nguyên tử, ký hiệu và nhiều thông tin thú vị khác. Bảng tuần hoàn giờ đây chỉ cách bạn một cú vuốt!
                    </Text>

                </Layout>
                {/*--[tab 2]--------------------------------------------------------------------*/}
                <View
                    style={tailwind("flex-1 items-center bg-white/100")}
                >
                    <SquareImage
                        percent={0.7}
                        src={require("../assets/images/onboard_3.png")}
                        customStyle={[tailwind("mt-15p rounded-xl"), { backgroundColor: "#07A9F0" },]}
                    />

                    <Text category='h5' style={tailwind("pointer-events-none my-10")}>
                        Học tương tác
                    </Text>
                    <Fragment key="content-text">
                        <Text style={tailwind("text-center px-7")}>
                            Chạm vào bất kỳ nguyên tố nào để xem thông tin chi tiết như khối lượng nguyên tử, cấu hình electron và nhiều hơn nữa.Hãy bắt đầu hành trình học tập của bạn!
                        </Text>
                    </Fragment>
                    <View key="button-group" style={tailwind("w-3/4 my-15p")}>
                        <Button status="info" onPress={() => router.replace("/signup")}>Học ngay</Button>
                        <Button appearance="outline" status="info" style={tailwind("mt-10")}>Thôi để lần sau</Button>
                    </View>
                </View>
            </ViewPager>
            {RenderCurrentPageIndex(selectedIndex, setSelectedIndex, tailwind)}
        </Fragment>
    );
}

function RenderCurrentPageIndex(currentIndex: number, setSelectedIndex: React.Dispatch<React.SetStateAction<number>>, tailwind: (_classNames: string) => Style): React.ReactNode {
    return (
        <View style={tailwind("flex flex-row w-full h-20 bg-white/100")}>
            <View style={tailwind("w-1/3")}>
                {currentIndex !== 0 &&
                    <Button status="info" style={tailwind("h-full p-0")} appearance="ghost" onPress={() => setSelectedIndex(pre => pre - 1)}>Quay lại</Button>
                }

            </View>
            {/* Middle Parallelograms */}
            <View style={tailwind("flex-1 flex-row justify-center items-center")}>
                {Array.from({ length: 3 }, (_, index) => (
                    <Parallelogram
                        key={index}
                        width={"30%"}
                        height={100}
                        style={[
                            tailwind('w-10 h-20'),
                            { color: currentIndex === index ? "#007BFF" : "#B0B0B0" },
                        ]}
                    />
                ))}
            </View>
            <View style={tailwind("w-1/3 h-20")}>
                {currentIndex !== 2 &&
                    <Button status="info" style={tailwind("h-full p-0")} appearance="ghost" onPress={() => setSelectedIndex(pre => pre + 1)}>Tiếp</Button>
                }

            </View>

        </View>


    )
}

const styles = StyleSheet.create({

    responsiveImage: {
        // Without height undefined it won't work
        width: "100%",
        height: undefined,
        // figure out your image aspect ratio
        aspectRatio: 1 / 1,
    },

});