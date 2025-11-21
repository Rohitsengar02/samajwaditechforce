import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, FAB, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SUGGESTIONS } from '@/constants/communicationData';

const SP_RED = '#E30512';

export default function SuggestionsScreen() {
    const router = useRouter();

    const handleNewSuggestion = () => {
        Alert.alert('New Suggestion', 'This would open a form to submit a new suggestion.');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return '#16a34a';
            case 'Implemented': return '#2563EB';
            case 'Under Review': return '#F59E0B';
            default: return '#64748b';
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#F59E0B', '#d97706']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Suggestions Box</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {SUGGESTIONS.map((item) => (
                    <Surface key={item.id} style={styles.card} elevation={2}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                            </View>
                            <Text style={styles.dateText}>{item.date}</Text>
                        </View>

                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>

                        <View style={styles.metaRow}>
                            <Text style={styles.submittedBy}>By: {item.submittedBy}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.voteContainer}>
                            <View style={styles.voteInfo}>
                                <MaterialCommunityIcons name="vote" size={20} color="#64748b" />
                                <Text style={styles.voteCount}>{item.votes} Votes</Text>
                            </View>
                            <TouchableOpacity style={styles.voteButton}>
                                <Text style={styles.voteButtonText}>Vote</Text>
                            </TouchableOpacity>
                        </View>
                    </Surface>
                ))}
            </ScrollView>

            <FAB
                icon="lightbulb-on"
                style={styles.fab}
                color="#fff"
                onPress={handleNewSuggestion}
                label="Suggest Idea"
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    dateText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    submittedBy: {
        fontSize: 12,
        color: '#64748b',
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 12,
    },
    voteContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    voteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    voteCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    voteButton: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    voteButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        backgroundColor: '#F59E0B',
    },
});
