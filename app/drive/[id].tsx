import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Dimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Text } from '@/components/Themed';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchCars, fetchDriveDetails } from '@/lib/api';
import {
  ChevronLeft,
  Navigation,
  Clock,
  Zap,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Gauge,
} from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 64;

/** Convert hex color + opacity → rgba string for react-native-chart-kit */
function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ── Stat row ──────────────────────────────────────────
const StatRow = ({
  label,
  value,
  unit,
  icon: Icon,
  iconColor = '#636366',
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: any;
  iconColor?: string;
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: '#1c1c1e',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ backgroundColor: '#1c1c1e', padding: 8, borderRadius: 10, marginRight: 12 }}>
        <Icon size={15} color={iconColor} />
      </View>
      <Text style={{ fontSize: 14, color: '#8e8e93', fontWeight: '500' }}>{label}</Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={{ fontSize: 17, fontWeight: '700', color: '#f5f5f5' }}>{value}</Text>
      {unit && <Text style={{ fontSize: 12, color: '#636366', marginLeft: 3 }}>{unit}</Text>}
    </View>
  </View>
);

// ── Chart section ─────────────────────────────────────
const ChartSection = ({
  title,
  data,
  color,
  unit,
}: {
  title: string;
  data: number[];
  color: string;
  unit: string;
}) => {
  if (data.length < 2) return null;

  const processedData = useMemo(() => {
    if (data.length <= 25) return data;
    const step = Math.ceil(data.length / 25);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  return (
    <GlassCard className="mb-3 p-5">
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#f5f5f5', marginBottom: 12 }}>{title}</Text>
      <LineChart
        data={{
          labels: [],
          datasets: [{ data: processedData }],
        }}
        width={chartWidth}
        height={160}
        chartConfig={{
          backgroundColor: '#141414',
          backgroundGradientFrom: '#141414',
          backgroundGradientTo: '#141414',
          decimalPlaces: 1,
          color: (opacity = 1) => hexToRgba(color, opacity),
          labelColor: () => '#636366',
          style: { borderRadius: 12 },
          propsForDots: { r: '0' },
          propsForBackgroundLines: {
            stroke: '#1c1c1e',
            strokeDasharray: '',
          },
          fillShadowGradientFrom: color,
          fillShadowGradientFromOpacity: 0.15,
          fillShadowGradientTo: color,
          fillShadowGradientToOpacity: 0,
        }}
        bezier
        withInnerLines={true}
        withOuterLines={false}
        style={{ borderRadius: 12, marginLeft: -15 }}
        yAxisSuffix={unit}
      />
    </GlassCard>
  );
};

// ── Loading skeleton ──────────────────────────────────
function DriveDetailSkeleton() {
  return (
    <View className="flex-1 bg-surface-primary p-4" style={{ paddingTop: 60 }}>
      <Skeleton width="60%" height={24} borderRadius={8} className="mb-3" />
      <Skeleton width="40%" height={18} borderRadius={8} className="mb-6" />
      <Skeleton width="100%" height={200} borderRadius={16} className="mb-4" />
      <Skeleton width="100%" height={160} borderRadius={16} className="mb-4" />
      <Skeleton width="100%" height={160} borderRadius={16} />
    </View>
  );
}

// ── Main screen ───────────────────────────────────────
export default function DriveDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: cars } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchCars,
  });

  const car = cars?.[0];

  const { data: drive, isLoading } = useQuery({
    queryKey: ['drive', car?.car_id, id],
    queryFn: () => fetchDriveDetails(car!.car_id, Number(id)),
    enabled: !!car && !!id,
  });

  const chartData = useMemo(() => {
    if (!drive?.drive_details) return null;
    return {
      speed: drive.drive_details.map((d) => d.speed),
      power: drive.drive_details.map((d) => d.power),
      elevation: drive.drive_details.map((d) => d.elevation).filter((e) => e !== null),
      tempInside: drive.drive_details
        .map((d) => d.climate_info.inside_temp)
        .filter((t) => t !== null) as number[],
      battery: drive.drive_details.map((d) => d.battery_level),
    };
  }, [drive]);

  if (isLoading || !drive) {
    return <DriveDetailSkeleton />;
  }

  const startDate = new Date(drive.start_date);

  return (
    <View className="flex-1 bg-surface-primary">
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Custom header ── */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            backgroundColor: '#1c1c1e',
            padding: 10,
            borderRadius: 12,
            marginRight: 14,
          }}
        >
          <ChevronLeft size={20} color="#f5f5f5" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 12, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#f5f5f5' }}>
            {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} Trip
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Route card ── */}
        <GlassCard className="p-5 mb-3">
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', marginRight: 14 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#30d158', backgroundColor: '#141414' }} />
              <View style={{ width: 1.5, height: 36, backgroundColor: '#2c2c2e', marginVertical: 4 }} />
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: '#ff453a', backgroundColor: '#141414' }} />
            </View>
            <View style={{ flex: 1, justifyContent: 'space-between', height: 68, paddingVertical: 0 }}>
              <View>
                <Text style={{ fontSize: 10, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Start
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#f5f5f5' }} numberOfLines={1}>
                  {drive.start_address || 'Unknown'}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 10, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Destination
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#f5f5f5' }} numberOfLines={1}>
                  {drive.end_address || 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* ── Stats ── */}
        <GlassCard className="p-5 mb-3">
          <StatRow label="Distance" value={drive.odometer_details.odometer_distance.toFixed(1)} unit="km" icon={Navigation} iconColor="#3b82f6" />
          <StatRow label="Duration" value={drive.duration_min} unit="min" icon={Clock} iconColor="#8e8e93" />
          <StatRow label="Energy" value={drive.energy_consumed_net?.toFixed(1) ?? '--'} unit="kWh" icon={Zap} iconColor="#ff9f0a" />
          <StatRow label="Efficiency" value={drive.consumption_net?.toFixed(0) ?? '--'} unit="Wh/km" icon={TrendingDown} iconColor="#30d158" />
          <StatRow label="Avg Speed" value={Math.round(drive.speed_avg ?? 0)} unit="km/h" icon={Gauge} iconColor="#bf5af2" />
          <StatRow label="Max Speed" value={Math.round(drive.speed_max ?? 0)} unit="km/h" icon={TrendingUp} iconColor="#ff453a" />
        </GlassCard>

        {/* ── Charts ── */}
        {chartData && (
          <>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#636366', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 10 }}>
              Trip Charts
            </Text>
            <ChartSection title="Speed" data={chartData.speed} color="#3b82f6" unit=" km/h" />
            <ChartSection title="Power" data={chartData.power} color="#ff453a" unit=" kW" />
            {chartData.elevation.length > 1 && (
              <ChartSection title="Elevation" data={chartData.elevation} color="#30d158" unit=" m" />
            )}
            <ChartSection title="Battery" data={chartData.battery} color="#bf5af2" unit="%" />
            {chartData.tempInside.length > 1 && (
              <ChartSection title="Cabin Temp" data={chartData.tempInside} color="#ff9f0a" unit=" °C" />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
