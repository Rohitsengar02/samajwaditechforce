import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOutUser } from '../utils/firebase';

const SP_RED = '#E30512';

interface SidebarProps {
    activePage?: string;
}

export default function DesktopSidebar({ activePage }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            // Sign out from Firebase
            await signOutUser();

            // Clear local storage
            await AsyncStorage.removeItem('userInfo');
            await AsyncStorage.removeItem('userToken');

            // Navigate to login
            router.replace('/signin');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const menuItems = [
        { icon: 'home', label: 'Home', route: '/(tabs)', key: 'home' },
        { icon: 'newspaper', label: 'News', route: '/(tabs)/news', key: 'news' },
        { icon: 'image-multiple', label: 'Posters', route: '/(tabs)/posters', key: 'posters' },
        { icon: 'checkbox-marked-circle-outline', label: 'Daily Work', route: '/(tabs)/daily-work', key: 'daily-work' },
        { icon: 'card-account-details', label: 'ID Card', route: '/(tabs)/idcard', key: 'idcard' },
        { icon: 'account-group', label: 'Join Us', route: '/joinus', key: 'joinus' },
        { icon: 'account', label: 'Profile', route: '/(tabs)/profile', key: 'profile' },
    ];

    const isActive = (itemKey: string) => {
        if (activePage) return activePage === itemKey;
        return pathname.includes(itemKey);
    };

    return (
        <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
                <MaterialCommunityIcons name="bicycle" size={40} color={SP_RED} />
                <Text style={styles.sidebarTitle}>Samajwadi</Text>
                <Text style={styles.sidebarSubtitle}>Tech Force</Text>
            </View>

            <View style={styles.sidebarMenu}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.menuItem, isActive(item.key) && styles.menuItemActive]}
                        activeOpacity={0.7}
                        onPress={() => router.push(item.route as any)}
                    >
                        <MaterialCommunityIcons
                            name={item.icon as any}
                            size={24}
                            color={isActive(item.key) ? SP_RED : '#64748b'}
                        />
                        <Text style={[styles.menuLabel, isActive(item.key) && styles.menuLabelActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.sidebarFooter}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={20} color="#64748b" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: 340,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
        paddingVertical: 24,
    },
    sidebarHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 32,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    sidebarTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        marginTop: 12,
    },
    sidebarSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    sidebarMenu: {
        flex: 1,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    menuItemActive: {
        backgroundColor: '#fef2f2',
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    menuLabelActive: {
        color: SP_RED,
        fontWeight: '700',
    },
    sidebarFooter: {
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
});
