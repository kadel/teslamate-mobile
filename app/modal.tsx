import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { Text } from '@/components/Themed';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface-primary">
      <Text style={{ fontSize: 20, fontWeight: '700' }}>Modal</Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
