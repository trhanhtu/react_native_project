// Filename: NotificationsScreen.tsx
"use client"

import EmptyNotifications from "@/src/components/EmptyNotifications"; // Might need internal translation
import NotificationItem from "@/src/components/NotificationItem"; // Might need internal translation
import { useNotifications } from "@/src/hooks/useNotifications";
import { WebSocketConnectionStatus } from "@/src/services/WebSocketService";
import { Notification_t } from "@/src/utils/types";
import { Button, Icon, Text, TopNavigation, TopNavigationAction } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type React from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useTailwind } from "tailwind-rn";

const NotificationsScreen: React.FC = () => {
    const tw = useTailwind()
    const router = useRouter()
    const {
        notifications,
        loading,
        refreshing,
        loadingMore,
        error,
        hasMore,
        wsStatus,
        fetchNotifications,
        loadMoreNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications()

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
            disabled={loading || refreshing || notifications.length === 0 || notifications.every((n: Notification_t) => n.read)}
        />
    );

    const renderFooter = () => {
        if (!loadingMore) return null

        return (
            <View style={tw("py-4 items-center")}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                
            </View>
        )
    }


    const renderConnectionIndicator = () => {
        let indicatorStyle = styles.disconnected;
        // Translated status texts
        let statusText = "Kết nối ngoại tuyến"; // Translated default

        switch (wsStatus) {
            case WebSocketConnectionStatus.CONNECTED:
                indicatorStyle = styles.connected;
                statusText = "Kết nối trực tuyến"; // Translated
                break;
            case WebSocketConnectionStatus.CONNECTING:
                indicatorStyle = styles.connecting;
                statusText = "Đang kết nối..."; // Translated
                break;
            case WebSocketConnectionStatus.ERROR:
                indicatorStyle = styles.error;
                statusText = "Lỗi kết nối"; // Translated
                break;

        }

        return (
            <View style={tw("flex-row items-center justify-center pb-2")}>
                <View style={[styles.connectionIndicator, indicatorStyle]} />
                <Text style={tw("text-white/100 text-xs ml-1")}>{statusText}</Text>
            </View>
        );
    };


    // Error State Display
    if (error && notifications.length === 0 && !loading && !refreshing) {
        return (
            <View style={tw("flex-1 bg-gray-50/100")}>
                <LinearGradient colors={["#8B5CF6", "#6366F1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <TopNavigation
                        title="Thông báo" // Translated
                        alignment="center"
                        accessoryLeft={renderBackAction}
                        style={tw("bg-transparent")}
                    />
                </LinearGradient>
                <View style={tw("flex-1 justify-center items-center p-4")}>
                    <Icon name="alert-circle-outline" width={60} height={60} fill="#EF4444" />
                    <Text style={tw("text-red-500/100 text-lg font-bold mt-4 mb-2")}>Đã xảy ra sự cố</Text> 
                    
                    <Text style={tw("text-gray-500/100 text-center mb-6")}>{error}</Text>
                    <Button
                        onPress={() => fetchNotifications(true)}
                        style={tw("bg-purple-600/100 border-0")}
                        accessoryLeft={(props) => <Icon {...props} name="refresh-outline" />}
                    >
                        Thử lại
                    </Button>
                </View>
            </View>
        );
    }

    // Initial Loading State Display
    if (loading && !refreshing && notifications.length === 0) { // Ensure this shows only on initial load
        return (
            <View style={tw("flex-1 bg-gray-50/100 justify-center items-center")}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                 
            </View>
        );
    }

    // Main Content Display
    return (
        <View style={tw("flex-1 bg-gray-50/100")}>
            <LinearGradient colors={["#8B5CF6", "#6366F1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <TopNavigation
                    title="Thông báo" // Translated
                    alignment="center"
                    accessoryLeft={renderBackAction}
                    accessoryRight={renderMarkAllReadAction}
                    style={tw("bg-transparent")}
                    // Add titleStyle if needed for white text
                    // Ensure icons are visible on gradient
                    appearance="control" // May help with icon colors on dark background
                />
                {renderConnectionIndicator()}
            </LinearGradient>


            <FlatList
                showsVerticalScrollIndicator={false}
                data={notifications}
                keyExtractor={(item,index) => `${item.id}_${index}`}
                renderItem={({ item }) => (
                    <NotificationItem // This component might need internal translation
                        notification={item}
                        onPress={() => markAsRead(item.id)}
                        onDelete={() => deleteNotification(item.id)}
                    />
                )}
                contentContainerStyle={tw("pb-4")} // Use pt-4 if header is transparent overlay? check layout
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchNotifications(true)}
                        colors={["#8B5CF6"]}
                        tintColor="#8B5CF6"
                    />
                }
                // Render EmptyNotifications only when not loading and list is truly empty
                ListEmptyComponent={!loading && !refreshing && notifications.length === 0 ? <EmptyNotifications /> : null} // EmptyNotifications might need internal translation
                ListFooterComponent={renderFooter}
                onEndReached={loadMoreNotifications}
                onEndReachedThreshold={0.5}
                initialNumToRender={10} // Optimization
            />

        </View>
    );
}

// Styles (Kept as original)
const styles = StyleSheet.create({
    badgeContainer: {
        marginLeft: 8,
        backgroundColor: 'red',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    connectionIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    connected: {
        backgroundColor: '#34D399',
    },
    disconnected: {
        backgroundColor: '#EF4444',
    },
    connecting: {
        backgroundColor: '#F59E0B',
    },
    error: {
        backgroundColor: '#A855F7', // Note: Original code had purple for error, kept as is. Consider red (#EF4444) for typical error indication.
    },
});

export default NotificationsScreen