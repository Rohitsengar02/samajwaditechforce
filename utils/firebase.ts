import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    onAuthStateChanged,
    User,
    sendPasswordResetEmail
} from 'firebase/auth';

// Firebase configuration from environment variables - keeps API keys secure
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (prevent duplicate initialization)
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

auth = getAuth(app);

// ============= EMAIL VERIFICATION FUNCTIONS =============

/**
 * Register a new user with email and password, then send verification email
 */
export const registerWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);

        return {
            user,
            error: null
        };
    } catch (error: any) {
        let errorMessage = 'Registration failed';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters';
                break;
            default:
                errorMessage = error.message;
        }

        return { user: null, error: errorMessage };
    }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: string | null; emailVerified: boolean }> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        return {
            user,
            error: null,
            emailVerified: user.emailVerified
        };
    } catch (error: any) {
        let errorMessage = 'Sign in failed';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled';
                break;
            default:
                errorMessage = error.message;
        }

        return { user: null, error: errorMessage, emailVerified: false };
    }
};

/**
 * Resend verification email to current user
 */
export const resendVerificationEmail = async (): Promise<{ success: boolean; error: string | null }> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'No user signed in' };
        }

        if (user.emailVerified) {
            return { success: false, error: 'Email is already verified' };
        }

        await sendEmailVerification(user);
        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Check if current user's email is verified (real-time check)
 */
export const checkEmailVerified = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) return false;

    // Reload user to get latest verification status
    await user.reload();
    return user.emailVerified;
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<{ success: boolean; error: string | null }> => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, error: null };
    } catch (error: any) {
        let errorMessage = 'Failed to send reset email';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            default:
                errorMessage = error.message;
        }

        return { success: false, error: errorMessage };
    }
};

/**
 * Sign out current user (handles both web SDK and native SDK)
 */
export const signOutUser = async (): Promise<{ success: boolean; error: string | null }> => {
    try {
        // Sign out from web Firebase SDK
        await signOut(auth);

        // Try to sign out from native Firebase and GoogleSignin if available
        try {
            const nativeAuth = require('@react-native-firebase/auth').default;
            const { GoogleSignin } = require('@react-native-google-signin/google-signin');

            // Sign out from native Firebase
            if (nativeAuth().currentUser) {
                await nativeAuth().signOut();
            }

            // Sign out from Google
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn) {
                await GoogleSignin.signOut();
            }
        } catch (nativeError) {
            // Native modules might not be available (e.g., on web)
            console.log('Native signout not available:', nativeError);
        }

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

export { auth, app };
