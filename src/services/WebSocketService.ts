import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { NotificationPayload } from '../utils/types';

// Replace with your actual server URL/IP
// If running locally on Android emulator: 'http://10.0.2.2:8080'
// If running locally on iOS simulator or physical device on same network: 'http://<your-local-ip>:8080'
// If deployed: 'https://your-azure-app-url'
const SERVER_URL = process.env.EXPO_PUBLIC_BASE_URL!;
const WS_ENDPOINT = `${SERVER_URL.replace(/^http/, 'ws')}/ws-connect`; // Use ws:// or wss://

// Define the structure of your Notification object coming from the backend


let client: Client | null = null;
let userSubscription: StompSubscription | null = null;
let connectionPromise: Promise<void> | null = null;
let resolveConnectionPromise: () => void;
let rejectConnectionPromise: (reason?: any) => void;

const setupConnectionPromise = () => {
  connectionPromise = new Promise((resolve, reject) => {
    resolveConnectionPromise = resolve;
    rejectConnectionPromise = reject;
  });
};

export const connectWebSocket = (authToken: string): Promise<void> => {
    if (client && client.active) {
        console.log('WebSocket already connected.');
        return connectionPromise || Promise.resolve();
    }

    console.log(`Attempting to connect WebSocket to ${WS_ENDPOINT}`);
    setupConnectionPromise(); // Setup the promise before connecting

    client = new Client({
        brokerURL: WS_ENDPOINT,
        connectHeaders: {
            Authorization: `Bearer ${authToken}`, // Send JWT token here
        },
        debug: function (str) {
            // console.log('STOMP Debug:', str); // Enable for detailed logs
        },
        reconnectDelay: 5000, // Try to reconnect every 5 seconds
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // Use WebSocket factory for React Native compatibility if needed
         webSocketFactory: () => {
             // This might require extra setup or specific WebSocket libraries on RN
             // For Expo Go, the polyfill often suffices. For bare RN, check compatibility.
             // If using SockJS on backend: you might need SockJS client library instead of raw WebSocket
             return new WebSocket(WS_ENDPOINT); // Standard WebSocket constructor
         },
    });

    client.onConnect = (frame) => {
        console.log('WebSocket Connected:', frame);
        if (resolveConnectionPromise) {
          resolveConnectionPromise(); // Resolve the promise on successful connection
        }
    };

    client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
         if (rejectConnectionPromise) {
            rejectConnectionPromise(new Error(frame.headers['message'] || 'STOMP Error'));
        }
    };

    client.onWebSocketError = (event) => {
        console.error("WebSocket error", event);
        if (rejectConnectionPromise) {
             rejectConnectionPromise(event);
        }
    };

     client.onDisconnect = (frame) => {
         console.log('WebSocket Disconnected.');
          // Reset subscription on disconnect
         userSubscription = null;
         // Reset promise state if connection is lost unexpectedly
         if (connectionPromise) {
             setupConnectionPromise(); // Reset promise for next connect attempt
         }
     };

    client.activate(); // Start the connection

    return connectionPromise as Promise<void>; // Return the promise
};

export const subscribeToUserNotifications = (
    onNotificationReceived: (notification: NotificationPayload) => void
): StompSubscription | null => {
    if (!client || !client.active) {
        console.error('Cannot subscribe, WebSocket is not connected.');
        return null;
    }

    if (userSubscription) {
        console.log('Already subscribed to user notifications.');
        return userSubscription;
    }

    console.log('Subscribing to /user/queue/notifications');
    userSubscription = client.subscribe('/user/queue/notifications', (message: IMessage) => {
        console.log('Received raw message:', message.body);
        try {
            const notification = JSON.parse(message.body) as NotificationPayload;
            onNotificationReceived(notification);
        } catch (error) {
            console.error('Failed to parse notification message:', error);
        }
    });
    console.log('Subscription initiated.');
    return userSubscription;
};

export const disconnectWebSocket = () => {
    if (client && client.active) {
        console.log('Deactivating WebSocket connection...');
        userSubscription = null; // Clear subscription reference
        client.deactivate(); // Gracefully disconnect
        client = null;
         connectionPromise = null; // Reset promise
        console.log('WebSocket deactivated.');
    } else {
        console.log('WebSocket already disconnected or not initialized.');
    }
};

export const isWebSocketConnected = (): boolean => {
    return client?.active ?? false;
};