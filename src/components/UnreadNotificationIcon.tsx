// Filename: UnreadNotificationIcon.tsx

"use client";

import { Text } from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { useTailwind } from "tailwind-rn";
import { subscribeToUnreadCount, useUnreadNotificationCount } from "../services/WebSocketService";

// Hook to subscribe to WS notifications and increment badge
function useWsBadge() {
    const [count, setCount] = useState(() => useUnreadNotificationCount());

    useEffect(() => {
        const unsubscribe = subscribeToUnreadCount((newCount) => {
            setCount(newCount);
        });
        return unsubscribe;  // cleanup on unmount
    }, []);

    return count;
}

const UnreadNotificationIcon = ({ color, size, focused }: { color: string; size: number; focused: boolean }) => {
    const tailwind = useTailwind();
    const count = useWsBadge();

    if (count === 0) return null;

    return (
        <Text category="h6" style={tailwind("bg-red-500/100 text-white/100 rounded-full px-3")}>
            {count}
        </Text>
    );
};

export default UnreadNotificationIcon;
