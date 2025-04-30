"use client"

import EmptyNotifications from "@/src/components/EmptyNotifications"
import NotificationItem from "@/src/components/NotificationItem"
import { useNotifications } from "@/src/hooks/useNotifications"
import { WebSocketConnectionStatus } from "@/src/services/WebSocketService"
import { Notification_t } from "@/src/utils/types"
import { Button, Icon, Text, TopNavigation, TopNavigationAction } from "@ui-kitten/components"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import type React from "react"
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native"
import { useTailwind } from "tailwind-rn"

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
        let statusText = "Real-time offline";

        switch (wsStatus) {
            case WebSocketConnectionStatus.CONNECTED:
                indicatorStyle = styles.connected;
                statusText = "Real-time active";
                break;
            case WebSocketConnectionStatus.CONNECTING:
                indicatorStyle = styles.connecting;
                statusText = "Connecting...";
                break;
            case WebSocketConnectionStatus.ERROR:
                indicatorStyle = styles.error; 
                statusText = "Connection error";
                break;
            
        }

        return (
            <View style={tw("flex-row items-center justify-center pb-2")}>
                <View style={[styles.connectionIndicator, indicatorStyle]} />
                <Text style={tw("text-white/100 text-xs ml-1")}>{statusText}</Text>
            </View>
        );
    };

    
    if (error && notifications.length === 0 && !loading && !refreshing) { 
        return (
            <View style={tw("flex-1 bg-gray-50/100")}>
                <LinearGradient colors={["#8B5CF6", "#6366F1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <TopNavigation
                        title="Notifications"
                        alignment="center"
                        accessoryLeft={renderBackAction}
                        style={tw("bg-transparent")}
                    />
                </LinearGradient>
                <View style={tw("flex-1 justify-center items-center p-4")}>
                    <Icon name="alert-circle-outline" width={60} height={60} fill="#EF4444" />
                    <Text style={tw("text-red-500/100 text-lg font-bold mt-4 mb-2")}>Something went wrong</Text>
                    <Text style={tw("text-gray-500/100 text-center mb-6")}>{error}</Text>
                    <Button
                        onPress={() => fetchNotifications(true)} 
                        style={tw("bg-purple-600/100 border-0")}
                        accessoryLeft={(props) => <Icon {...props} name="refresh-outline" />}
                    >
                        Try Again
                    </Button>
                </View>
            </View>
        );
    }
    
    if (loading && !refreshing) { 
        return (
            <View style={tw("flex-1 bg-gray-50/100 justify-center items-center")}>
                
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }
    
    return (
        <View style={tw("flex-1 bg-gray-50/100")}>
            <LinearGradient colors={["#8B5CF6", "#6366F1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <TopNavigation
                    
                    title="Notifications"
                    alignment="center"
                    accessoryLeft={renderBackAction}
                    accessoryRight={renderMarkAllReadAction}
                    style={tw("bg-transparent")}
                />
                {renderConnectionIndicator()} 
            </LinearGradient>

          
            <FlatList 
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
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
                        onRefresh={() => fetchNotifications(true)} 
                        colors={["#8B5CF6"]} 
                        tintColor="#8B5CF6" 
                    />
                }
                ListEmptyComponent={!loading && !refreshing ? <EmptyNotifications /> : null} 
                ListFooterComponent={renderFooter} 
                onEndReached={loadMoreNotifications} 
                onEndReachedThreshold={0.5} 
                initialNumToRender={10} 
            />

        </View>
    );
}

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
        backgroundColor: '#A855F7', 
    },
});

export default NotificationsScreen


