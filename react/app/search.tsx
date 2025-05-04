// Filename: GlobalSearchScreen.tsx
"use client"

import { searchElements } from "@/api/api";
import ElementCard from "@/src/components/ElementCard"; // Might need internal translation
import CustomStyles from "@/src/utils/styles";
import { DetailElement_t } from "@/src/utils/types";
import { Icon, IconProps, Input, Layout, Text } from "@ui-kitten/components";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, View } from "react-native";
import { useTailwind } from "tailwind-rn";

const SearchIcon = (props: IconProps) => <Icon {...props} name="search-outline" />
// const ClearIcon = (props: IconProps) => <Icon {...props} name="close-outline" /> // Defined but not explicitly used in renderRightAccessory's direct return

export default function GlobalSearchScreen() {
    const tw = useTailwind()
    const [searchQuery, setSearchQuery] = useState("")
    const { elements, loading, error, meta } = useElementSearch(searchQuery) // Use the custom hook
    const router = useRouter()
    // Pass keyword to ElementCard for potential highlighting
    const renderItem = ({ item }: { item: DetailElement_t }) => <ElementCard keyword={searchQuery} element={item} onPress={() => router.push(`/detailelement/${item.atomicNumber}` as Href)} />

    // Render empty list message based on search query presence
    const renderEmptyList = () => (
        <View style={tw("items-center justify-center py-8 px-4")}>
            <Text category="s1" style={tw("text-gray-500/100 text-center")}>
                
                {searchQuery.length > 0 ? "Không tìm thấy nguyên tố nào khớp với tìm kiếm của bạn" : "Bắt đầu nhập để tìm kiếm nguyên tố"}
            </Text>
        </View>
    )

    // Function to clear the search input
    const clearSearch = () => {
        setSearchQuery("")
    }

    // Render clear button only when there is text
    const renderRightAccessory = (props: IconProps) =>
        searchQuery.length > 0 ? <Icon {...props} name="close-outline" onPress={clearSearch} /> : <React.Fragment /> // Use React.Fragment for no icon case

    return (
        <SafeAreaView style={tw("flex-1 bg-gray-100/100")}>
            <Layout style={tw("flex-1")}>
                
                <View style={[tw("px-4 py-3 bg-white/100"), CustomStyles.shadow]}>
                    <Text category="h5" style={tw("mb-2 text-center font-bold")}>
                        Tìm kiếm Bảng tuần hoàn
                    </Text>
                    <Input
                        // Translated placeholder
                        placeholder="Tìm nguyên tố theo tên, ký hiệu, hoặc số hiệu nguyên tử"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        accessoryLeft={SearchIcon}
                        accessoryRight={renderRightAccessory}
                        style={tw("rounded-lg bg-gray-50/100 border-gray-200/100")}
                        textStyle={tw("text-gray-900/100")}
                        size="large"
                    />
                </View>

                
                {loading ? (
                    <View style={tw("flex-1 items-center justify-center")}>
                        <ActivityIndicator size="large" color="#3366FF" />
                        
                    </View>
                ) : error ? (
                    <View style={tw("flex-1 items-center justify-center p-4")}>
                        <Text category="s1" status="danger" style={tw("text-center")}>
                            
                            {error}
                        </Text>
                        
                    </View>
                ) : (
                    <FlatList
                        data={elements}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.atomicNumber.toString()}
                        contentContainerStyle={tw("p-2")}
                        ListEmptyComponent={renderEmptyList} // Show message when list is empty
                        numColumns={1} // Ensure single column layout
                        key={"portrait-search"} // Unique key if layout changes
                        ListFooterComponent={
                            // Show pagination info only if results and meta exist
                            meta && elements.length > 0 ? (
                                <View style={tw("py-2 items-center")}>
                                    <Text category="c1" style={tw("text-gray-500/100")}>
                                        
                                        Hiển thị {elements.length} trên {meta.totalItems} nguyên tố
                                    </Text>
                                    <Text category="c1" style={tw("text-gray-500/100")}>
                                        Trang {meta.current} trên {meta.totalPages}
                                    </Text>
                                </View>
                            ) : null
                        }
                    // Add onEndReached logic here if implementing pagination
                    />
                )}
            </Layout>
        </SafeAreaView>
    )
}

// --- Search Result Type Definition ---
interface SearchResult {
    meta: {
        current: number
        pageSize: number
        totalPages: number
        totalItems: number
    }
    result: DetailElement_t[]
}

//------------------------------------------------------
// Custom Hook: useElementSearch (with debouncing)
//------------------------------------------------------
export function useElementSearch(query: string, delay = 500) {
    const [elements, setElements] = useState<DetailElement_t[]>([])
    const [meta, setMeta] = useState<SearchResult["meta"] | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (searchQuery: string) => {
            // If search query is empty, clear results
            if (!searchQuery.trim()) {
                setElements([])
                setMeta(null)
                setError(null) // Clear error when query is cleared
                setLoading(false) // Ensure loading is false
                return
            }

            try {
                setLoading(true)
                setError(null)
                // Assuming searchElements API handles pagination and returns the structure
                const response: SearchResult | null = await searchElements(searchQuery, 1, 10) // Example: page 1, limit 10

                if (response) {
                    setElements(response.result)
                    setMeta(response.meta)
                } else {
                    // Set specific error message for failed search
                    setError("Tìm kiếm nguyên tố thất bại") // Translated
                }
            } catch (err) {
                // Set specific error message for caught exceptions
                setError("Tìm kiếm nguyên tố thất bại. Vui lòng thử lại.") // Translated
                console.error("Search error:", err)
            } finally {
                setLoading(false)
            }
        }, delay),
        [delay], // Dependency array for useCallback
    )

    // Effect to trigger search when query changes
    useEffect(() => {
        debouncedSearch(query)

        // Cleanup function to cancel debounced call on unmount or query change
        return () => {
            debouncedSearch.cancel()
        }
    }, [query, debouncedSearch]) // Dependencies for useEffect

    return { elements, meta, loading, error }
}

//------------------------------------------------------
// Debounce Utility Function
//------------------------------------------------------
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null

    // The debounced function
    const debounced = function (this: any, ...args: Parameters<T>) {
        // Clear the previous timeout if it exists
        if (timeout) clearTimeout(timeout)
        // Set a new timeout to execute the function after the wait period
        timeout = setTimeout(() => func.apply(this, args), wait)
    }

    // Method to cancel the scheduled execution
    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    // Return the debounced function along with its cancel method
    return debounced as T & { cancel: () => void }
}