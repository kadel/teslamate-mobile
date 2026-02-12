import React from 'react';
import { View, ViewProps } from 'react-native';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Subtle card with dark surface and thin border.
 * "Glass" effect via slight transparency and border — no BlurView dependency needed.
 */
export function GlassCard({ children, className = '', style, ...props }: GlassCardProps) {
  return (
    <View
      className={`bg-surface-card rounded-2xl border border-edge-subtle ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}
