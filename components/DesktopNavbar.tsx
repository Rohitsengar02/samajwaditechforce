import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SP_RED = '#E30512';

interface NavbarProps {
    title: string;
    breadcrumb?: string;
}

export default function DesktopNavbar({ title, breadcrumb = 'Home' }: NavbarProps) {
    return (
        <View style={styles.navbar}>
            <View style={styles.navbarLeft}>
                <Text style={styles.navbarTitle}>{title}</Text>
                <Text style={styles.navbarBreadcrumb}>{breadcrumb} / {title}</Text>
            </View>

            <View style={styles.navbarRight}>
                <TouchableOpacity style={styles.navButton}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#64748b" />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>3</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton}>
                    <MaterialCommunityIcons name="magnify" size={24} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.profileButton}>
                    <MaterialCommunityIcons name="account-circle" size={32} color={SP_RED} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    navbar: {
        height: 70,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
    },
    navbarLeft: {
        flex: 1,
    },
    navbarTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 2,
    },
    navbarBreadcrumb: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    navbarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: SP_RED,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    profileButton: {
        marginLeft: 8,
    },
});
