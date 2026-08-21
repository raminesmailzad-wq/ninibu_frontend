import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

const icon = (name: keyof typeof Ionicons.glyphMap) =>
  (props: { color: string; size: number }) => (
    <Ionicons name={name} size={props.size} color={props.color} />
  );

const TAB_CONTENT_HEIGHT = 64;
const MIN_BOTTOM_PADDING = 10;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, MIN_BOTTOM_PADDING);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#81798D',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          marginTop: 1,
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
        tabBarStyle: {
          height: TAB_CONTENT_HEIGHT + bottomPadding,
          paddingTop: 4,
          paddingBottom: bottomPadding,
          backgroundColor: '#fff',
          borderTopColor: colors.border,
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'خانه', tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="health" options={{ title: 'سلامت', tabBarIcon: icon('heart-outline') }} />
      <Tabs.Screen name="community" options={{ title: 'جامعه', tabBarIcon: icon('chatbubbles-outline') }} />
      <Tabs.Screen name="discover" options={{ title: 'کشف', tabBarIcon: icon('compass-outline') }} />
      <Tabs.Screen name="more" options={{ title: 'بیشتر', tabBarIcon: icon('grid-outline') }} />
    </Tabs>
  );
}
