import React from 'react';
import { View } from 'react-native';
import { Text } from './Themed';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 14, color: '#8e8e93' }}>{path}</Text>
    </View>
  );
}
