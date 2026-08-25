import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '@/theme';

const icon = (name: keyof typeof Ionicons.glyphMap, activeName?: keyof typeof Ionicons.glyphMap) =>
  (props: { color: string; size: number; focused: boolean }) => (
    <Ionicons name={props.focused && activeName ? activeName : name} size={props.size} color={props.color} />
  );

const TAB_CONTENT_HEIGHT = 61;
const MIN_BOTTOM_PADDING = 8;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, MIN_BOTTOM_PADDING);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryStrong,
        tabBarInactiveTintColor: '#827B8D',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 9.5,
          fontWeight: '800',
          fontFamily: typography.bold,
          marginTop: 1,
          writingDirection: 'rtl',
        },
        tabBarItemStyle: {
          paddingTop: 5,
          borderRadius: 16,
        },
        tabBarStyle: {
          height: TAB_CONTENT_HEIGHT + bottomPadding,
          paddingTop: 4,
          paddingBottom: bottomPadding,
          paddingHorizontal: 5,
          backgroundColor: '#fff',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 14,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'خانه', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen name="health" options={{ title: 'سلامت فرزند', tabBarIcon: icon('heart-outline', 'heart') }} />
      <Tabs.Screen name="maternal-health" options={{ title: 'سلامت مادر', tabBarIcon: icon('heart-circle-outline', 'heart-circle') }} />
      <Tabs.Screen name="community" options={{ title: 'جامعه', tabBarIcon: icon('chatbubbles-outline', 'chatbubbles') }} />
      <Tabs.Screen name="more" options={{ title: 'بیشتر', tabBarIcon: icon('grid-outline', 'grid') }} />
      <Tabs.Screen name="discover" options={{ href: null }} />
    </Tabs>
  );
}
