"use client"

import { searchElements } from "@/api/api"
import ElementCard from "@/src/components/ElementCard"
import { DetailElement_t } from "@/src/utils/types"
import { Icon, IconProps, Input, Layout, Text } from "@ui-kitten/components"
import { Href, useRouter } from "expo-router"
import React, { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, SafeAreaView, View } from "react-native"
import { useTailwind } from "tailwind-rn"

const SearchIcon = (props: IconProps) => <Icon {...props} name="search-outline" />
const ClearIcon = (props: IconProps) => <Icon {...props} name="close-outline" />

export default function GlobalSearchScreen() {
    const tw = useTailwind()
    const [searchQuery, setSearchQuery] = useState("")
    const { elements, loading, error, meta } = useElementSearch(searchQuery)
    const router = useRouter()
    const renderItem = ({ item }: { item: DetailElement_t }) => <ElementCard keyword={searchQuery} element={item} onPress={() => router.push(`/detailelement/${item.atomicNumber}` as Href)} />

    const renderEmptyList = () => (
        <View style={tw("items-center justify-center py-8")}>
            <Text category="s1">
                {searchQuery.length > 0 ? "No elements found matching your search" : "Start typing to search for elements"}
            </Text>
        </View>
    )

    const clearSearch = () => {
        setSearchQuery("")
    }

    const renderRightAccessory = (props: IconProps) =>
        searchQuery.length > 0 ? <Icon {...props} name="close-outline" onPress={clearSearch} /> : <React.Fragment />

    return (
        <SafeAreaView style={tw("flex-1 bg-gray-100")}>
            <Layout style={tw("flex-1")}>
                <View style={tw("px-4 py-3 bg-white shadow-sm")}>
                    <Text category="h5" style={tw("mb-2 text-center")}>
                        Periodic Table Search
                    </Text>
                    <Input
                        placeholder="Search elements by name, symbol, or atomic number"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        accessoryLeft={SearchIcon}
                        accessoryRight={renderRightAccessory}
                        style={tw("rounded-lg")}
                    />
                </View>

                {loading ? (
                    <View style={tw("flex-1 items-center justify-center")}>
                        <ActivityIndicator size="large" color="#3366FF" />
                    </View>
                ) : error ? (
                    <View style={tw("flex-1 items-center justify-center p-4")}>
                        <Text category="s1" status="danger">
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
                        ListEmptyComponent={renderEmptyList}
                        numColumns={1}
                        key={"portrait"}
                        ListFooterComponent={
                            meta && elements.length > 0 ? (
                                <View style={tw("py-2 items-center")}>
                                    <Text category="c1">
                                        Showing {elements.length} of {meta.totalItems} elements
                                    </Text>
                                    <Text category="c1">
                                        Page {meta.current} of {meta.totalPages}
                                    </Text>
                                </View>
                            ) : null
                        }
                    />
                )}
            </Layout>
        </SafeAreaView>
    )
}

interface SearchResult {
    meta: {
        current: number
        pageSize: number
        totalPages: number
        totalItems: number
    }
    result: DetailElement_t[]
}

// Custom hook for debounced element search
export function useElementSearch(query: string, delay = 500) {
    const [elements, setElements] = useState<DetailElement_t[]>([])
    const [meta, setMeta] = useState<SearchResult["meta"] | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const debouncedSearch = useCallback(
        debounce(async (searchQuery: string) => {
            if (!searchQuery.trim()) {
                setElements([])
                setMeta(null)
                return
            }

            try {
                setLoading(true)
                setError(null)
                const response: SearchResult | null = await searchElements(searchQuery, 1, 10)

                if (response) {
                    setElements(response.result)
                    setMeta(response.meta)
                } else {
                    setError("Failed to search elements")
                }
            } catch (err) {
                setError("Failed to search elements. Please try again.")
                console.error("Search error:", err)
            } finally {
                setLoading(false)
            }
        }, delay),
        [delay],
    )

    useEffect(() => {
        debouncedSearch(query)

        // Cleanup function to cancel debounced search if component unmounts
        return () => {
            debouncedSearch.cancel()
        }
    }, [query, debouncedSearch])

    return { elements, meta, loading, error }
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null

    const debounced = function (this: any, ...args: Parameters<T>) {

        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, args), wait)
    }

    debounced.cancel = () => {
        if (timeout) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    return debounced as T & { cancel: () => void }
}

