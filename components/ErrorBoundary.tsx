import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <MaterialCommunityIcons name="alert-circle" size={80} color="#E30512" />
                        <Text style={styles.title}>कुछ गलत हो गया</Text>
                        <Text style={styles.subtitle}>Something went wrong</Text>

                        <ScrollView style={styles.errorContainer}>
                            <Text style={styles.errorText}>
                                {this.state.error?.toString() || 'Unknown error'}
                            </Text>
                        </ScrollView>

                        <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                            <Text style={styles.buttonText}>पुनः प्रयास करें / Try Again</Text>
                        </TouchableOpacity>

                        <Text style={styles.helpText}>
                            यदि समस्या बनी रहती है, तो कृपया ऐप को पुनः आरंभ करें
                            {'\n'}
                            If the problem persists, please restart the app
                        </Text>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#64748b',
        marginTop: 8,
        marginBottom: 24,
        textAlign: 'center',
    },
    errorContainer: {
        maxHeight: 200,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    errorText: {
        fontSize: 12,
        color: '#64748b',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#E30512',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    helpText: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 18,
    },
});
