import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/Themed';

interface StatusBadgeProps {
  label: string;
  color: 'green' | 'blue' | 'orange' | 'red' | 'gray';
}

const colorMap = {
  green: { bg: 'bg-dim-green', text: '#30d158', dot: '#30d158' },
  blue: { bg: 'bg-dim-blue', text: '#3b82f6', dot: '#3b82f6' },
  orange: { bg: 'bg-dim-orange', text: '#ff9f0a', dot: '#ff9f0a' },
  red: { bg: 'bg-dim-red', text: '#ff453a', dot: '#ff453a' },
  gray: { bg: 'bg-surface-elevated', text: '#8e8e93', dot: '#8e8e93' },
};

export function StatusBadge({ label, color }: StatusBadgeProps) {
  const scheme = colorMap[color];

  return (
    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${scheme.bg}`}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: scheme.dot,
          marginRight: 6,
        }}
      />
      <Text style={{ color: scheme.text, fontSize: 12, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}
