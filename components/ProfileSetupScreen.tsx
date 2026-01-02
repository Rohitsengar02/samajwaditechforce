import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Colors
const GREEN = '#009933';
const RED = '#E30512';
const DARK = '#1a1a1a';

interface ProfileSetupProps {
  navigation: any;
  route?: {
    params?: {
      phone?: string;
      googleData?: {
        name?: string;
        email?: string;
        photo?: string;
      };
    };
  };
}

export default function ProfileSetupScreen({ navigation, route }: ProfileSetupProps) {
  // Defensive parameter access
  const params = route?.params || {};
  const googleData = params.googleData;
  const initialPhone = params.phone ? params.phone.replace('+91', '') : '';

  // Safe State Initialization
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(initialPhone);
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');

  // Password State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data safely on mount
  useEffect(() => {
    try {
      console.log('🟢 ProfileSetupScreen: Mounting...');
      if (googleData) {
        console.log('📦 Setting Google Data:', googleData);
        if (googleData.name) setName(googleData.name);
        if (googleData.email) setEmail(googleData.email);
        if (googleData.photo) setPhoto(googleData.photo);
      }
    } catch (error) {
      console.error('Error in ProfileSetup useEffect:', error);
    }
  }, [googleData]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not select image');
    }
  };

  const formatDob = (text: string) => {
    const nums = text.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4, 8)}`;
  };

  const isValid =
    name.trim().length > 0 &&
    phone.length === 10 &&
    gender.length > 0 &&
    dob.length === 10 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleContinue = () => {
    if (!isValid) {
      if (password.length < 6) {
        Alert.alert('Invalid Password', 'Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Mismatch', 'Passwords do not match');
        return;
      }
      Alert.alert('Incomplete', 'Please fill all fields correctly');
      return;
    }

    setLoading(true);

    const profileData = {
      name: name.trim(),
      email: email.trim(),
      phone: `+91${phone}`,
      gender,
      dob,
      password, // Include password
      profileImage: photo,
      isGoogleUser: !!googleData,
    };

    // Simulate async processing
    setTimeout(() => {
      setLoading(false);
      try {
        navigation.navigate('AddressForm', { profileData });
      } catch (err) {
        Alert.alert('Navigation Error', 'Could not navigate to Address Form.');
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Complete Profile</Text>
        <Text style={styles.subtitle}>Help us know you better</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Upload */}
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.photoWrapper}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons name="camera" size={32} color="#666" />
              </View>
            )}
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
          />

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
              keyboardType="number-pad"
              placeholder="0000000000"
            />
          </View>

          <Text style={styles.label}>Create Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              secureTextEntry={!showPassword}
            />
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderChip, gender === g && styles.genderChipSelected]}
                onPress={() => setGender(g)}
              >
                <MaterialCommunityIcons
                  name={g === 'Male' ? 'gender-male' : g === 'Female' ? 'gender-female' : 'gender-transgender'}
                  size={20}
                  color={gender === g ? '#fff' : '#666'}
                />
                <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Date of Birth (DD/MM/YYYY)</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={(t) => setDob(formatDob(t))}
            placeholder="DD/MM/YYYY"
            keyboardType="number-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#f0f0f0', color: '#666' }]}
            value={email}
            editable={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!isValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: RED,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK,
    marginBottom: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: DARK,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: DARK,
  },
  eyeIcon: {
    padding: 4,
  },
  phoneInputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f9fafb',
    height: '100%',
    textAlignVertical: 'center',
    lineHeight: 50,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    color: DARK,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  genderChipSelected: {
    borderColor: GREEN,
    backgroundColor: GREEN,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  genderTextSelected: {
    color: '#fff',
  },
  button: {
    marginTop: 40,
    height: 54,
    backgroundColor: RED,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: RED,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
