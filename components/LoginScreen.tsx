import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');

  const handleSendOTP = () => {
    if (phone.length >= 10) {
      navigation.navigate('OTPVerification', { phone });
    }
  };

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Welcome to UrbanVendor</Title>
            <Text style={styles.subtitle}>Enter your phone number to get started</Text>
            
            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              style={styles.input}
            />
            
            <Button
              mode="contained"
              onPress={handleSendOTP}
              style={styles.button}
              disabled={phone.length < 10}
            >
              Send OTP
            </Button>
          </Card.Content>
        </Card>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 8,
    borderRadius: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#64748b',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 8,
  },
});
