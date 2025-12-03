import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Surface, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DISCUSSIONS } from '@/constants/communicationData';

const SP_RED = '#E30512';

export default function DiscussionScreen() {
    const router = useRouter();

    const handleNewPost = () => {
        Alert.alert('New Discussion', 'This would open a form to start a new discussion topic.');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Discussion Room</Text>  
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {DISCUSSIONS.map((item) => (
                    <Surface key={item.id} style={styles.card} elevation={2}>
                        <View style={styles.cardHeader}>
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{item.user}</Text>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </View>
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="dots-horizontal" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.postContent}>{item.content}</Text>

                        <View style={styles.tagsContainer}>
                            {item.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.cardFooter}>
                            <TouchableOpacity style={styles.actionButton}>
                                <MaterialCommunityIcons name="thumb-up-outline" size={20} color="#64748b" />
                                <Text style={styles.actionText}>{item.likes}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <MaterialCommunityIcons name="comment-outline" size={20} color="#64748b" />
                                <Text style={styles.actionText}>{item.comments}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <MaterialCommunityIcons name="share-variant-outline" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                    </Surface>
                ))}
            </ScrollView>

            <FAB
                icon="plus"
                style={styles.fab}
                color="#fff"
                onPress={handleNewPost}
                label="New Topic"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    content: {
        padding: 20,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#e2e8f0',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    timeText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    postContent: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 22,
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    tag: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 4,
    },
    actionText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        backgroundColor: '#3B82F6',
    },
});
