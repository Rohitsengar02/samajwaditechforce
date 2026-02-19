import { io, Socket } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Get correct Socket.IO URL based on platform
const getSocketUrl = () => {
    // 1. If explicitly set in env (e.g. for specific builds OR dev override), use it
    if (process.env.EXPO_PUBLIC_API_URL) {
        let url = process.env.EXPO_PUBLIC_API_URL;
        // Remove /api if present to get best base URL
        url = url.replace(/\/api\/?$/, '');

        // For web development, localhost is more reliable than the local IP
        if (Platform.OS === 'web' && __DEV__ && (url.includes('192.168.') || url.includes('172.') || url.includes('10.'))) {
            url = url.replace(/(\d{1,3}\.){3}\d{1,3}/, 'localhost');
        }

        // Handle Android Emulator case for localhost
        if (Platform.OS === 'android' && url.includes('localhost')) {
            url = url.replace('localhost', '10.0.2.2');
        }

        console.log('🔌 Using Configured Socket URL:', url);
        return url;
    }

    // 2. In DEV, use environment detection
    if (__DEV__) {
        const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
        console.log(`🔌 DEV Mode: Using ${host} for Socket.IO`);
        return `http://${host}:5001`;
    }

    // 3. Fallback / Production default
    return 'https://api.samajwaditechforce.com';
};

const SOCKET_URL = getSocketUrl();

class SocketService {
    socket: Socket | null = null;
    listeners = new Map<string, (notification: any) => void>();

    connect(userId?: string) {
        if (this.socket?.connected) {
            console.log('✅ Socket already connected');
            return;
        }

        console.log(`🔌 Attempting Socket.IO connection to: ${SOCKET_URL}`);
        this.socket = io(SOCKET_URL, {
            // Remove strict websocket transport to allow polling fallback for better stability on local networks
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            timeout: 10000, // 10 second timeout
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket?.id);
            if (userId && this.socket) {
                this.socket.emit('join', userId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('❌ Socket connection error:', error.message);
        });

        // Listen for 'notification' event (matches backend emission)
        this.socket.on('notification', async (notification: any) => {
            console.log('🔔 Notification received from backend:', notification);

            // Send local push notification
            await this.sendLocalNotification(notification);

            // Notify all listeners
            this.listeners.forEach((callback) => {
                callback(notification);
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('Socket disconnected manually');
        }
    }

    onNotification(id: string, callback: (notification: any) => void) {
        this.listeners.set(id, callback);
    }

    offNotification(id: string) {
        this.listeners.delete(id);
    }

    async sendLocalNotification(notification: any) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: notification.title,
                    body: notification.message,
                    data: {
                        type: notification.type,
                        relatedItem: notification.relatedItem
                    },
                    sound: true,
                },
                trigger: null,
            });
        } catch (error) {
            console.error('Error sending local notification:', error);
        }
    }
}

export default new SocketService();
