// Filename: WebSocketServiceController.ts

import { useEffect, useState } from 'react';
import type { Notification_t } from '../utils/types';

//
// ── UNREAD-COUNT PUB/SUB ─────────────────────────────────────────────────────────
//

// single source of truth for unread count
let globalUnreadCount = 0;                                          // Observer pattern :contentReference[oaicite:3]{index=3}
type CountListener = (count: number) => void;
const countListeners = new Set<CountListener>();

/** Increment unread count by 1 and notify listeners */
export function incrementUnreadCount() {
  globalUnreadCount += 1;
  countListeners.forEach((l) => l(globalUnreadCount));
}

/** Subscribe to unread-count changes; returns unsubscribe fn */
export function subscribeToUnreadCount(listener: CountListener): () => void {
  countListeners.add(listener);
  return () => { countListeners.delete(listener); };                // cleanup :contentReference[oaicite:4]{index=4}
}

/** React hook: current unread count, auto-updates via subscribe */
export function useUnreadNotificationCount(): number {
  const [count, setCount] = useState(globalUnreadCount);
  useEffect(() => {
    const unsubscribe = subscribeToUnreadCount(setCount);
    return unsubscribe;                                             // auto-unsubscribe on unmount :contentReference[oaicite:5]{index=5}
  }, []);
  return count;
}



//
// ── WEBSOCKET SINGLETON ──────────────────────────────────────────────────────────
//

type MessageHandler = (notification: Notification_t) => void;

export class WebSocketServiceController {
  private static instance: WebSocketServiceController;
  private ws?: WebSocket;
  private token: string | null = null;
  private readonly url = process.env.EXPO_PUBLIC_WEBSOCKET_BASE_URL!;
  private notificationSubscribers = new Set<MessageHandler>();
  private reconnectDelay = 5000;                                    // auto-reconnect delay :contentReference[oaicite:6]{index=6}

  /** Get the singleton instance */
  public static getInstance(): WebSocketServiceController {
    if (!WebSocketServiceController.instance) {
      WebSocketServiceController.instance = new WebSocketServiceController();
    }
    return WebSocketServiceController.instance;                     // singleton pattern :contentReference[oaicite:7]{index=7}
  }

  /** Supply the Bearer token (must call before connect) */
  public setToken(token: string) {
    this.token = token;
  }

  /** Open WebSocket connection (no-op if already open or no token) */
  public connect() {
    if (this.ws || !this.token) return                        // guard clause :contentReference[oaicite:1]{index=1}

    console.log('[WS] connecting to', this.url)
    // truyền token trong subprotocol → Sec-WebSocket-Protocol header :contentReference[oaicite:2]{index=2}
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('[WS] connected');
      // if your server needs an explicit subscribe frame:
      const frame = { action: 'subscribe', topic: '/topic/notifications', token: `Bearer ${this.token}` };
      this.ws!.send(JSON.stringify(frame));                         // send subscribe :contentReference[oaicite:10]{index=10}
    };

    this.ws.onmessage = (evt) => {
      console.log('[WS] message', evt.data);
      try {
        const notif: Notification_t = JSON.parse(evt.data);
        incrementUnreadCount();                                     // bump badge :contentReference[oaicite:11]{index=11}
        this.notificationSubscribers.forEach((h) => h(notif));      // notify handlers :contentReference[oaicite:12]{index=12}
      } catch (e) {
        console.error('[WS] parse error', e);
      }
    };

    this.ws.onerror = (e) => console.error('[WS] error', e);
    this.ws.onclose = () => {
      console.warn(`[WS] closed — reconnecting in ${this.reconnectDelay}ms`);
      this.ws = undefined;
      setTimeout(() => this.connect(), this.reconnectDelay);        // auto-reconnect :contentReference[oaicite:13]{index=13}
    };
  }

  /** Close the connection */
  public disconnect() {
    this.ws?.close();
    this.ws = undefined;
  }

  /** Subscribe to live notifications; returns nothing */
  public subscribeToNotifications(handler: MessageHandler) {
    this.notificationSubscribers.add(handler);
  }

  /** Unsubscribe (or clear all if no handler provided) */
  public unsubscribeFromNotifications(handler?: MessageHandler) {
    if (handler) this.notificationSubscribers.delete(handler);
    else this.notificationSubscribers.clear();
  }

  /** Check if socket is open */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;                // readyState API :contentReference[oaicite:14]{index=14}
  }
}

export default WebSocketServiceController;
