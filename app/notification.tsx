"use client"

import EmptyNotifications from "@/src/components/EmptyNotifications"
import NotificationItem from "@/src/components/NotificationItem"
import useNotifications from "@/src/hooks/useNotifications"
import { WebSocketServiceController } from "@/src/services/WebSocketService"
import { Notification_t } from "@/src/utils/types"
import { Button, Icon, Text, TopNavigation, TopNavigationAction } from "@ui-kitten/components"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import type React from "react"
import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native"
import Toast from "react-native-toast-message"
import { useTailwind } from "tailwind-rn"

const NotificationsScreen: React.FC = () => {
    const tw = useTailwind()
    const router = useRouter()
    const {
        notifications,
        loading,
        refreshing,
        loadingMore,
        hasMore,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMoreNotifications,
        addNotification,
        unreadCount,
    } = useNotifications()

    const [wsConnected, setWsConnected] = useState(false);

    useEffect(() => {
        const ws = WebSocketServiceController.getInstance();
        const handler = (n: Notification_t) => addNotification(n);
        ws.subscribeToNotifications(handler);
        return () => { ws.unsubscribeFromNotifications(handler) };
    }, []);
        const renderBackAction = () => (
            <TopNavigationAction
                icon={(props) => <Icon {...props} name="arrow-back-outline" />}
                onPress={() => router.back()}
            />
        )

        const renderMarkAllReadAction = () => (
            <TopNavigationAction
                icon={(props) => <Icon {...props} name="checkmark-square-2-outline" />}
                onPress={markAllAsRead}
                disabled={loading || refreshing || notifications.length === 0 || notifications.every((n) => n.read)}
            />
        )

        const renderFooter = () => {
            if (!loadingMore) return null

            return (
                <View style={tw("py-4 items-center")}>
                    <ActivityIndicator size="small" color="#8B5CF6" />
                </View>
            )
        }
        const handleEndReached = () => {
            if (!loadingMore && hasMore) {
                loadMoreNotifications()
            }
        }
        if (error) {
            return (
                <View style={tw("flex-1 bg-gray-50/100")}>
                    <TopNavigation title="Notifications" alignment="center" accessoryLeft={renderBackAction} />
                    <View style={tw("flex-1 justify-center items-center p-4")}>
                        <Icon name="alert-circle-outline" width={60} height={60} fill="#EF4444" />
                        <Text style={tw("text-red-500/100 text-lg font-bold mt-4 mb-2")}>Something went wrong</Text>
                        <Text style={tw("text-gray-500/100 text-center mb-6")}>{error}</Text>
                        <Button
                            onPress={() => fetchNotifications()}
                            style={tw("bg-purple-600/100 border-0")}
                            accessoryLeft={(props) => <Icon {...props} name="refresh-outline" />}
                        >
                            Try Again
                        </Button>
                    </View>
                </View>
            )
        }

        return (
            <View style={tw("flex-1 bg-gray-50/100")}>
                <LinearGradient colors={["#8B5CF6", "#6366F1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <TopNavigation
                        title={(evaProps) => (
                            <View style={tw("flex-row items-center")}>
                                <Text {...evaProps} style={[evaProps?.style, tw("text-white/100 font-bold")]}>
                                    Notifications
                                </Text>
                                {unreadCount > 0 && (
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>{unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                        alignment="center"
                        accessoryLeft={renderBackAction}
                        accessoryRight={renderMarkAllReadAction}
                        style={tw("bg-transparent")}
                    />

                    {/* WebSocket connection indicator */}
                    <View style={tw("flex-row items-center justify-center pb-2")}>
                        <View style={[styles.connectionIndicator, wsConnected ? styles.connected : styles.disconnected]} />
                        <Text style={tw("text-white/100 text-xs")}>{wsConnected ? "Real-time updates active" : "Offline mode"}</Text>
                    </View>
                </LinearGradient>

                <FlatList
                    data={notifications}
                    keyExtractor={(item, index) => `item_${index}_${item.id.toString()}`}
                    renderItem={({ item }) => (
                        <NotificationItem
                            notification={item}
                            onPress={() => markAsRead(item.id)}
                            onDelete={() => deleteNotification(item.id)}
                        />
                    )}
                    contentContainerStyle={tw("pb-4")}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchNotifications}
                            colors={["#8B5CF6"]}
                            tintColor="#8B5CF6"
                        />
                    }
                    ListEmptyComponent={!loading ? <EmptyNotifications /> : null}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.3}
                    initialNumToRender={10}
                />

                {loading && !refreshing && (
                    <View style={tw("absolute inset-0 bg-white/60 justify-center items-center")}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                    </View>
                )}

                <Toast />
            </View>
        )
    }

const styles = StyleSheet.create({
        badgeContainer: {
            backgroundColor: "#EF4444",
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginLeft: 8,
        },
        badgeText: {
            color: "white",
            fontSize: 12,
            fontWeight: "bold",
        },
        connectionIndicator: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 6,
        },
        connected: {
            backgroundColor: "#10B981",
        },
        disconnected: {
            backgroundColor: "#F59E0B",
        },
    })

    export default NotificationsScreen
