import { Redirect } from 'expo-router';
import { Dimensions } from 'react-native';

export default function Index() {
  const { width } = Dimensions.get('window');
  const isDesktop = width >= 768;

  if (isDesktop) {
    return <Redirect href="/desktop-screen-pages/home" />;
  }

  return <Redirect href="/onboarding" />;
}
