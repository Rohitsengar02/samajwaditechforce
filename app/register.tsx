import React from 'react';
import InteractiveLoginScreen from '../components/InteractiveLoginScreen';
// NOTE: We do NOT use WebBrowser.maybeCompleteAuthSession() here because 
// InteractiveLoginScreen handles auth safely.

export default function RegisterScreen() {
  // Directly render the Interactive Login Page as requested.
  // The component now uses router.push() so it works without navigation prop.
  return <InteractiveLoginScreen />;
}
