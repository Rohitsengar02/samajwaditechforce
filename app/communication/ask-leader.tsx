import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, FAB, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LEADER_QA } from '@/constants/communicationData';

const SP_RED = '#E30512';

export default function AskLeaderScreen() {
    const router = useRouter();

    const handleAskQuestion = () => {
        Alert.alert('Ask Question', 'This would open a form to submit a question to the leader.');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[SP_RED, '#b91c1c']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ask the Leader</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.introCard}>
                    <MaterialCommunityIcons name="account-voice" size={40} color={SP_RED} />
                    <Text style={styles.introText}>
                        Directly ask questions to Akhilesh Yadav. Selected questions will be answered here.
                    </Text>
                </View>

                {LEADER_QA.map((item) => (
                    <Surface key={item.id} style={styles.card} elevation={2}>
                        <View style={styles.cardHeader}>
                            <Chip
                                icon={item.status === 'Answered' ? 'check-circle' : 'clock-outline'}
                                style={[styles.statusChip, item.status === 'Answered' ? styles.answeredChip : styles.pendingChip]}
                                textStyle={styles.chipText}
                            >
                                {item.status}
                            </Chip>
                            <Text style={styles.dateText}>{item.date}</Text>
                        </View>

                        <Text style={styles.questionText}>Q: {item.question}</Text>
                        <Text style={styles.askedBy}>Asked by {item.askedBy}</Text>

                        {item.answer && (
                            <View style={styles.answerContainer}>
                                <View style={styles.answerHeader}>
                                    <MaterialCommunityIcons name="check-decagram" size={20} color={SP_RED} />
                                    <Text style={styles.answerLabel}>Leader's Response:</Text>
                                </View>
                                <Text style={styles.answerText}>{item.answer}</Text>
                            </View>
                        )}
                    </Surface>
                ))}
            </ScrollView>

            <FAB
                icon="comment-question"
                style={styles.fab}
                color="#fff"
                onPress={handleAskQuestion}
                label="Ask Question"
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
    introCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        gap: 16,
    },
    introText: {
        flex: 1,
        fontSize: 14,
        color: '#7f1d1d',
        fontWeight: '500',
        lineHeight: 20,
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
    statusChip: {
        height: 28,
    },
    answeredChip: {
        backgroundColor: '#dcfce7',
    },
    pendingChip: {
        backgroundColor: '#f1f5f9',
    },
    chipText: {
        fontSize: 11,
        marginRight: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    questionText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 6,
        lineHeight: 24,
    },
    askedBy: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    answerContainer: {
        backgroundColor: '#fff1f2',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: SP_RED,
    },
    answerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    answerLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: SP_RED,
    },
    answerText: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 22,
    },
    fab: {
        position: 'absolute',
        margin: 20,
        right: 0,
        bottom: 0,
        backgroundColor: SP_RED,
    },
});
