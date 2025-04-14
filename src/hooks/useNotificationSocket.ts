import { Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';

import { markNotificationAsRead } from '@/api/api';
import {
    connectWebSocket,
    disconnectWebSocket,
    isWebSocketConnected,
    subscribeToUserNotifications,
} from '@/src/services/WebSocketService'; // Adjust path
import GlobalStorage from '../utils/GlobalStorage'; // Adjust path
import { NotificationPayload } from '../utils/types';

export function useNotificationSocket() {
    const router = useRouter(); // Use router inside the hook for navigation

    // --- Internal State ---
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isLoadingToken, setIsLoadingToken] = useState(true);
    const [isConnected, setIsConnected] = useState(isWebSocketConnected());
    const shownNotificationIds = useRef(new Set<number>());

    // --- Effect to load token ---
    useEffect(() => {
        let isMounted = true;
        const loadToken = async () => {
            try {
                setIsLoadingToken(true); // Ensure loading state is true initially
                const token = await GlobalStorage.getItem('access_token');
                if (isMounted) {
                    setAuthToken(token);
                }
            } catch (e) {
                console.error("Failed to load auth token:", e);
                if (isMounted) {
                    setAuthToken(null); // Ensure token is null on error
                }
            } finally {
                if (isMounted) {
                    setIsLoadingToken(false); // Set loading false after attempt
                }
            }
        };
        loadToken();
        return () => { isMounted = false; }
    }, []); // Runs once on initial hook mount

    // --- Notification Handler Callback ---
    const handleIncomingNotification = useCallback(
        (notification: NotificationPayload) => {
            console.log('Handling incoming notification via hook:', notification);
            if (shownNotificationIds.current.has(notification.id)) {
                console.log(`Notification ${notification.id} already processed.`);
                return;
            }

            Toast.show({
                type: 'info',
                text1: notification.title,
                text2: notification.message,
                visibilityTime: 5000,
                autoHide: true,
                topOffset: 60,
                props: {
                    notificationId: notification.id,
                    notificationType: notification.type,
                    objectIdentifier: notification.objectIdentifier,
                },
                onPress: async () => {
                    Toast.hide();
                    const { id: notificationId, type: notificationType, objectIdentifier: objectIdentifier } = notification;

                    if (!shownNotificationIds.current.has(notificationId)) {
                        shownNotificationIds.current.add(notificationId);
                        console.log(`Toast pressed, marking notification ${notificationId} as read.`);
                        try {
                            await markNotificationAsRead(notificationId);
                        } catch (error) {
                            console.error("Failed to mark notification as read on press:", error);
                        }
                    } else {
                        console.log(`Notification ${notificationId} already marked as read (press).`);
                    }

                    // Deep linking logic using the router obtained within the hook
                    console.log(`Navigating for type: ${notificationType}, object: ${objectIdentifier}`);
                    if (notificationType === 'new podcast') {
                        router.push(`/podcastlist/${objectIdentifier}` as Href);
                    } else if (notificationType === 'like comment') {
                        const relevantId = Number(objectIdentifier);
                        if (!isNaN(relevantId)) {
                            router.push(`/detailpodcast/${relevantId}` as Href);
                        } else {
                            console.warn(`Invalid ID for deep link: ${objectIdentifier}`);
                        }
                    } else {
                        console.log(`No navigation configured for type: ${notificationType}`);
                    }
                },
                onHide: async () => {
                    const { id: notificationId } = notification;
                    if (!shownNotificationIds.current.has(notificationId)) {
                        shownNotificationIds.current.add(notificationId);
                        console.log(`Toast hidden, marking notification ${notificationId} as read.`);
                        try {
                            await markNotificationAsRead(notificationId);
                        } catch (error) {
                            console.error("Failed to mark notification as read on hide:", error);
                        }
                    } else {
                        console.log(`Notification ${notificationId} already marked as read (hide).`);
                    }
                },
            });
        },
        [router] // Dependency: router
    );

    // --- Connection Management Effect ---
    useEffect(() => {
        let isMounted = true;
        let subscription: ReturnType<typeof subscribeToUserNotifications> | null = null;

        const manageConnection = async () => {
            if (isLoadingToken) return; // Wait until token check is complete

            if (authToken) {
                if (!isWebSocketConnected()) {
                    try {
                        console.log('[Hook] Auth token present, attempting WebSocket connection...');
                        await connectWebSocket(authToken);
                        if (isMounted) {
                            console.log('[Hook] WebSocket connected successfully, subscribing...');
                            if (!subscription) {
                                subscription = subscribeToUserNotifications(handleIncomingNotification);
                            }
                            setIsConnected(true);
                        }
                    } catch (error) {
                        console.error('[Hook] WebSocket connection/subscription failed:', error);
                        if (isMounted) setIsConnected(false);
                    }
                } else {
                    console.log('[Hook] WebSocket already connected.');
                    if (!subscription) {
                        subscription = subscribeToUserNotifications(handleIncomingNotification);
                        console.log('[Hook] Resubscribed to notifications.');
                    }
                    if (isMounted) setIsConnected(true);
                }
            } else { // No token
                if (isWebSocketConnected()) {
                    console.log('[Hook] No auth token, disconnecting WebSocket.');
                    shownNotificationIds.current.clear();
                    disconnectWebSocket();
                    if (isMounted) setIsConnected(false);
                    subscription = null;
                }
            }
        };

        manageConnection();

        // Cleanup
        return () => {
            isMounted = false;
            console.log('[Hook] Effect cleanup triggered.');
            // Disconnection is handled by the logic above when authToken becomes null.
            // Explicit disconnect here might be needed if the component using the hook unmounts
            // while the user is still logged in, but for RootLayout this is less likely.
            // If you have an explicit logout function, call disconnectWebSocket() there too.
        };
    }, [authToken, isLoadingToken, handleIncomingNotification]); // Dependencies

    // --- Return connection status (optional) ---
    return { isConnected, isLoadingToken };
}