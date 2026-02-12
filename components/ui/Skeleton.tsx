import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width, height = 16, borderRadius = 8, className = '' }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#2c2c2e',
        },
        animatedStyle,
      ]}
    />
  );
}

/** Full dashboard skeleton for loading state */
export function DashboardSkeleton() {
  return (
    <View className="flex-1 bg-surface-primary p-6">
      <View className="items-center mt-8 mb-10">
        <Skeleton width={200} height={200} borderRadius={100} />
      </View>
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Skeleton width="100%" height={90} borderRadius={16} />
        </View>
        <View className="flex-1">
          <Skeleton width="100%" height={90} borderRadius={16} />
        </View>
      </View>
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Skeleton width="100%" height={90} borderRadius={16} />
        </View>
        <View className="flex-1">
          <Skeleton width="100%" height={90} borderRadius={16} />
        </View>
      </View>
      <Skeleton width="100%" height={70} borderRadius={16} />
    </View>
  );
}

/** Activity list skeleton */
export function ActivitySkeleton() {
  return (
    <View className="flex-1 bg-surface-primary p-4">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="mb-3">
          <Skeleton width="100%" height={120} borderRadius={16} />
        </View>
      ))}
    </View>
  );
}
