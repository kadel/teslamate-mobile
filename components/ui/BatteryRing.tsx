import React, { useEffect } from 'react';
import { View as RNView } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/Themed';
import { Zap } from 'lucide-react-native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BatteryRingProps {
  /** 0–100 */
  level: number;
  /** Diameter in px */
  size?: number;
  /** Ring thickness */
  strokeWidth?: number;
  /** Whether currently charging */
  isCharging?: boolean;
  /** Range text shown below percentage */
  rangeText?: string;
}

export function BatteryRing({
  level,
  size = 200,
  strokeWidth = 10,
  isCharging = false,
  rangeText,
}: BatteryRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.min(level, 100) / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [level]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // Color stops based on level
  const getColor = () => {
    if (isCharging) return '#30d158';
    if (level <= 15) return '#ff453a';
    if (level <= 30) return '#ff9f0a';
    return '#30d158';
  };

  return (
    <RNView style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="batteryGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={getColor()} stopOpacity="1" />
            <Stop offset="1" stopColor={getColor()} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1c1c1e"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#batteryGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      {/* Center content */}
      <RNView
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isCharging && (
          <RNView style={{ marginBottom: 2 }}>
            <Zap size={18} color="#30d158" fill="#30d158" />
          </RNView>
        )}
        <RNView style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 48, fontWeight: '700', color: '#f5f5f5', lineHeight: 52 }}>
            {level ?? '--'}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#636366', marginBottom: 6, marginLeft: 2 }}>
            %
          </Text>
        </RNView>
        {rangeText && (
          <Text style={{ fontSize: 14, color: '#8e8e93', marginTop: 2 }}>
            {rangeText}
          </Text>
        )}
      </RNView>
    </RNView>
  );
}
