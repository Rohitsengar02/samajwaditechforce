import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

// Simplified frame preview data
const FRAME_PREVIEWS = [
    {
        id: 'default',
        name: '🎯 Classic Frame',
        colors: [SP_RED, '#16a34a'],
        description: 'Traditional horizontal layout',
    },
    {
        id: 'bold_strip',
        name: '💎 Professional Card',
        colors: ['#1e3a8a', '#3b82f6'],
        description: 'Blue gradient with golden accent',
    },
    {
        id: 'minimal_white',
        name: '✨ Modern Minimal',
        colors: [SP_RED, '#16a34a'],
        description: 'Clean design with accent line',
    },
    {
        id: 'red_accent',
        name: '🔴 Red Power',
        colors: [SP_RED, '#7f1d1d'],
        description: 'Bold red with geometric accents',
    },
    {
        id: 'gradient_wave',
        name: '🌊 Vibrant Wave',
        colors: ['#6366f1', '#d946ef'],
        description: 'Purple gradient with wave effects',
    },
    {
        id: 'curved_tech',
        name: '🚀 STF Special',
        colors: [SP_RED, SP_GREEN],
        description: 'Circular badge with tech styling',
    },
    {
        id: 'stf_bold',
        name: '🟥 STF Bold',
        colors: [SP_RED, SP_GREEN],
        description: 'Sharp, professional block design',
    },
    {
        id: 'stf_rounded',
        name: '💊 STF Rounded',
        colors: [SP_RED, SP_GREEN],
        description: 'Modern rounded pillar layout',
    },
    {
        id: 'stf_tabbed',
        name: '📑 STF Tabbed',
        colors: [SP_RED, SP_GREEN],
        description: 'Interlocking tab design',
    },
    {
        id: 'stf_minimal',
        name: '✨ STF Minimal',
        colors: [SP_RED, SP_GREEN],
        description: 'Clean floating elements',
    },
];

interface FrameSelectorProps {
    selectedTemplate: string;
    onSelectTemplate: (templateId: string) => void;
}

const FrameSelector: React.FC<FrameSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a Frame</Text>
            <Text style={styles.subtitle}>Choose a template for your poster</Text>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {FRAME_PREVIEWS.map((frame) => (
                    <TouchableOpacity
                        key={frame.id}
                        style={[
                            styles.frameCard,
                            selectedTemplate === frame.id && styles.selectedFrameCard
                        ]}
                        onPress={() => onSelectTemplate(frame.id)}
                        activeOpacity={0.7}
                    >
                        {/* Frame Preview */}
                        <LinearGradient
                            colors={frame.colors as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.framePreview}
                        >
                            {/* Simplified preview content */}
                            <View style={styles.previewContent}>
                                {/* Photo placeholder */}
                                <View style={styles.photoPlaceholder}>
                                    <MaterialCommunityIcons name="account" size={24} color="#fff" />
                                </View>

                                {/* Text placeholders */}
                                <View style={styles.textPlaceholders}>
                                    <View style={[styles.textLine, { width: '60%', height: 10 }]} />
                                    <View style={[styles.textLine, { width: '40%', height: 6, marginTop: 4 }]} />
                                    <View style={styles.contactRow}>
                                        <View style={[styles.textLine, { width: 30, height: 6 }]} />
                                        <View style={[styles.textLine, { width: 30, height: 6 }]} />
                                    </View>
                                </View>
                            </View>

                            {/* Selection indicator */}
                            {selectedTemplate === frame.id && (
                                <View style={styles.selectedBadge}>
                                    <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                                </View>
                            )}
                        </LinearGradient>

                        {/* Frame Info */}
                        <View style={styles.frameInfo}>
                            <Text style={[
                                styles.frameName,
                                selectedTemplate === frame.id && styles.selectedFrameName
                            ]}>
                                {frame.name}
                            </Text>
                            <Text style={styles.frameDescription}>{frame.description}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 16,
    },
    scrollContent: {
        gap: 12,
        paddingBottom: 20,
    },
    frameCard: {
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    selectedFrameCard: {
        borderColor: SP_RED,
        backgroundColor: '#fff',
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    framePreview: {
        height: 70,
        borderRadius: 10,
        margin: 8,
        padding: 12,
        position: 'relative',
    },
    previewContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    photoPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    textPlaceholders: {
        flex: 1,
    },
    textLine: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 3,
    },
    contactRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
    },
    selectedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: SP_RED,
        borderRadius: 12,
        padding: 2,
    },
    frameInfo: {
        padding: 12,
        paddingTop: 4,
    },
    frameName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    selectedFrameName: {
        color: SP_RED,
    },
    frameDescription: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
    },
});

export default FrameSelector;
