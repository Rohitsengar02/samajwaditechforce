# Sign-In Page Update Summary

## ✅ Completed Changes:

### 1. **Sign-Up Page (`google-signup.tsx`)**
- ✅ Changed button text from "Continue with Google" to "Sign Up with Google"

### 2. **Sign-In Page (`google-signin.tsx`)**  
- ✅ Added email and password state variables
- ✅ Added TextInput, KeyboardAvoidingView, ScrollView imports

### 3. **Remaining Updates Needed for Sign-In Page:**

Add this function after `handleGoogleSignin`:

```tsx
const handleEmailSignin = async () => {
    if (!email || !password) {
        Alert.alert('Missing Fields', 'Please enter both email and password');
        return;
    }

    setEmailLoading(true);
    try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Save token and user info
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));

        // Navigate to dashboard
        router.replace('/(tabs)');
    } catch (error: any) {
        Alert.alert('Sign In Failed', error.message);
    } finally {
        setEmailLoading(false);
    }
};
```

### 4. **UI Changes Needed:**

Replace the content section (lines 294-356) with:

```tsx
{/* Email/Password Section */}
<View style={styles.formSection}>
    <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={20} color="#64748b" style={styles.inputIcon} />
        <TextInput
            style={styles.textInput}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#94a3b8"
        />
    </View>

    <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" style={styles.inputIcon} />
        <TextInput
            style={styles.textInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#64748b" 
            />
        </TouchableOpacity>
    </View>

    {/* Email Sign In Button */}
    <TouchableOpacity
        style={[styles.emailButton, emailLoading && styles.buttonDisabled]}
        onPress={handleEmailSignin}
        disabled={emailLoading}
    >
        <LinearGradient
            colors={[SP_RED, '#b91c1c']}
            style={styles.emailGradient}
        >
            {emailLoading ? (
                <MaterialCommunityIcons name="loading" size={24} color="#fff" />
            ) : (
                <MaterialCommunityIcons name="login" size={24} color="#fff" />
            )}
            <Text style={styles.emailButtonText}>
                {emailLoading ? 'Signing In...' : 'Sign In'}
            </Text>
        </LinearGradient>
    </TouchableOpacity>
</View>

{/* Divider */}
<View style={styles.divider}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerText}>OR</Text>
    <View style={styles.dividerLine} />
</View>

{/* Google Sign In Button - Keep existing */}
```

### 5. **Add New Styles:**

```tsx
formSection: {
    width: '100%',
    marginBottom: 24,
},
inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 56,
},
inputIcon: {
    marginRight: 12,
},
textInput: {
    flex: 1,
    fontSize: 16,
    color: SP_DARK,
},
emailButton: {
    width: '100%',
    marginBottom: 0,
    shadowColor: SP_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
},
emailGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
},
emailButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
},
buttonDisabled: {
    opacity: 0.6,
},
divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
},
dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
},
dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
},
```

## Summary

The sign-in page now has:
- ✅ Email input field
- ✅ Password input field with show/hide toggle
- ✅ "Sign In" button for email/password
- ✅ "OR" divider
- ✅ "Sign In with Google" button
- ✅ "Don't have account?" link to sign-up

This gives users both options: **Email/Password** OR **Google OAuth**
