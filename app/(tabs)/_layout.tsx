import { Tabs, usePathname } from 'expo-router';
import { useColorScheme, Platform, View, Dimensions } from 'react-native';
import { Home, BookOpen, User, CreditCard, Newspaper, Image } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const isDesktop = width >= 768;
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.includes('/posters')) return 'Posters';
    if (path.includes('/news')) return 'News';

    if (path.includes('/idcard')) return 'ID Card';
    if (path.includes('/profile')) return 'Profile';
    return 'Home';
  };

  const tabs = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: isDark ? '#666' : '#999',
        tabBarStyle: isDesktop ? { display: 'none' } : {
          backgroundColor: isDark ? '#1a0b2e' : '#ffffff',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 85 : 60 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 25 : insets.bottom + 5,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="posters"
        options={{
          title: 'Posters',
          tabBarIcon: ({ size, color }) => (
            <Image size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ size, color }) => (
            <Newspaper size={size} color={color} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="idcard"
        options={{
          title: 'ID Card',
          tabBarIcon: ({ size, color }) => (
            <CreditCard size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="nearby-volunteers"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="survey"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="feedback"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="child-protection"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );

  if (isDesktop) {
    return tabs;
  }

  return tabs;
}
