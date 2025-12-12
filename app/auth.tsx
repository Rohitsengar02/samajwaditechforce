import { View, Text, ActivityIndicator } from 'react-native';

export default function AuthPage() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ marginTop: 20, fontSize: 16 }}>Completing Authentication...</Text>
            <ActivityIndicator size="large" color="#E30512" style={{ marginTop: 20 }} />
        </View>
    );
}
