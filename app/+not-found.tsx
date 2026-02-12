import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/Themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-surface-primary px-8">
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#f5f5f5', marginBottom: 8 }}>
          Screen not found
        </Text>
        <Link href="/">
          <Text style={{ fontSize: 14, color: '#3b82f6', fontWeight: '600' }}>
            Go to home screen
          </Text>
        </Link>
      </View>
    </>
  );
}
