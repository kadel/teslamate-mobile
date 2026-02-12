import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Dimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Text } from '@/components/Themed';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchCars, fetchChargeDetails } from '@/lib/api';
import {
  ChevronLeft,
  Zap,
  Clock,
  Coins,
  Thermometer,
  TrendingUp,
  Plug,
} from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 76;

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
const NUM_X_LABELS = 4;
const MAX_POINTS = 25;

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

const ChartSection = ({
  title,
  data,
  dates,
  color,
  unit,
}: {
  title: string;
  data: number[];
  dates?: string[];
  color: string;
  unit: string;
}) => {
  if (data.length < 2) return null;

  const { processedData, labels } = useMemo(() => {
    let sampled = data;
    let sampledDates = dates;

    if (data.length > MAX_POINTS) {
      const step = Math.ceil(data.length / MAX_POINTS);
      sampled = data.filter((_, i) => i % step === 0);
      sampledDates = dates?.filter((_, i) => i % step === 0);
    }

    if (!sampledDates?.length) return { processedData: sampled, labels: [] };

    const labelStep = Math.max(1, Math.floor((sampled.length - 1) / (NUM_X_LABELS - 1)));
    const xLabels = sampled.map((_, i) => {
      if (i % labelStep === 0 || i === sampled.length - 1) {
        return formatTime(sampledDates[i]);
      }
      return '';
    });

    return { processedData: sampled, labels: xLabels };
  }, [data, dates]);

  return (
    <GlassCard className="mb-3 p-5">
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#f5f5f5', marginBottom: 12 }}>{title}</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: processedData }],
        }}
        width={chartWidth}
        height={180}
        chartConfig={{
          backgroundColor: '#141414',
          backgroundGradientFrom: '#141414',
          backgroundGradientTo: '#141414',
          decimalPlaces: 0,
          color: (opacity = 1) => hexToRgba(color, opacity),
          labelColor: () => '#636366',
          style: { borderRadius: 12 },
          propsForDots: { r: '0' },
          propsForBackgroundLines: {
            stroke: '#1c1c1e',
            strokeDasharray: '',
          },
          propsForLabels: { fontSize: 10 },
          fillShadowGradientFrom: color,
          fillShadowGradientFromOpacity: 0.15,
          fillShadowGradientTo: color,
          fillShadowGradientToOpacity: 0,
        }}
        bezier
        withInnerLines={true}
        withOuterLines={false}
        style={{ borderRadius: 12 }}
        yAxisSuffix={unit}
      />
    </GlassCard>
  );
};

// ── Loading skeleton ──────────────────────────────────
function ChargeDetailSkeleton() {
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

// ── Helpers ───────────────────────────────────────────
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
}

// ── Main screen ───────────────────────────────────────
export default function ChargeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: cars } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchCars,
  });

  const car = cars?.[0];

  const { data: charge, isLoading } = useQuery({
    queryKey: ['charge', car?.car_id, id],
    queryFn: () => fetchChargeDetails(car!.car_id, Number(id)),
    enabled: !!car && !!id,
  });

  const chartData = useMemo(() => {
    if (!charge?.charge_details) return null;
    const details = charge.charge_details;
    const dates = details.map((d) => d.date);

    const rangePairs = details
      .filter((d) => d.battery_info.ideal_battery_range != null)
      .map((d) => ({ value: d.battery_info.ideal_battery_range, date: d.date }));

    return {
      battery: details.map((d) => d.battery_level),
      power: details.map((d) => d.charger_details.charger_power),
      voltage: details.map((d) => d.charger_details.charger_voltage),
      current: details.map((d) => d.charger_details.charger_actual_current),
      dates,
      range: rangePairs.map((p) => p.value),
      rangeDates: rangePairs.map((p) => p.date),
    };
  }, [charge]);

  if (isLoading || !charge) {
    return <ChargeDetailSkeleton />;
  }

  const startDate = new Date(charge.start_date);
  const endDate = new Date(charge.end_date);
  const efficiency =
    charge.charge_energy_used > 0
      ? ((charge.charge_energy_added / charge.charge_energy_used) * 100).toFixed(1)
      : '--';
  const cableType = charge.charge_details?.[0]?.conn_charge_cable || 'Unknown';

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
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#f5f5f5' }} numberOfLines={1}>
            {charge.address || 'Unknown'} Charge
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Summary card ── */}
        <GlassCard className="p-5 mb-3">
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#f5f5f5', marginBottom: 8 }}>
            {charge.address || 'Unknown Location'}
          </Text>
          <Text style={{ fontSize: 13, color: '#8e8e93', marginBottom: 4 }}>
            {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            {' → '}
            {endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <View className="flex-row items-center" style={{ marginTop: 4 }}>
            <View style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#30d158' }}>
                {charge.battery_details.start_battery_level}% → {charge.battery_details.end_battery_level}%
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* ── Stats ── */}
        <GlassCard className="p-5 mb-3">
          <StatRow label="Energy Added" value={charge.charge_energy_added?.toFixed(1) ?? '--'} unit="kWh" icon={Zap} iconColor="#30d158" />
          <StatRow label="Energy Used" value={charge.charge_energy_used?.toFixed(1) ?? '--'} unit="kWh" icon={Zap} iconColor="#ff9f0a" />
          <StatRow label="Efficiency" value={efficiency} unit="%" icon={TrendingUp} iconColor="#3b82f6" />
          <StatRow label="Duration" value={formatDuration(charge.duration_min)} icon={Clock} iconColor="#8e8e93" />
          {charge.cost != null && charge.cost > 0 && (
            <StatRow label="Cost" value={charge.cost.toFixed(2)} icon={Coins} iconColor="#3b82f6" />
          )}
          {charge.outside_temp_avg != null && (
            <StatRow label="Outside Temp" value={Math.round(charge.outside_temp_avg)} unit="°C" icon={Thermometer} iconColor="#3b82f6" />
          )}
          <StatRow label="Cable Type" value={cableType} icon={Plug} iconColor="#8e8e93" />
        </GlassCard>

        {/* ── Charts ── */}
        {chartData && (
          <>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#636366', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 10 }}>
              Charge Charts
            </Text>
            <ChartSection title="Battery Level" data={chartData.battery} dates={chartData.dates} color="#bf5af2" unit="%" />
            <ChartSection title="Charger Power" data={chartData.power} dates={chartData.dates} color="#ff453a" unit=" kW" />
            <ChartSection title="Voltage" data={chartData.voltage} dates={chartData.dates} color="#3b82f6" unit=" V" />
            <ChartSection title="Current" data={chartData.current} dates={chartData.dates} color="#ff9f0a" unit=" A" />
            {chartData.range.length > 1 && (
              <ChartSection title="Range" data={chartData.range} dates={chartData.rangeDates} color="#30d158" unit=" km" />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
