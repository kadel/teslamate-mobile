import React from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { fetchCars, fetchCarStatus, wakeUp } from '@/lib/api';
import { BatteryRing } from '@/components/ui/BatteryRing';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  Thermometer,
  MapPin,
  Lock,
  Unlock,
  Zap,
  Navigation,
  Power,
  Shield,
} from 'lucide-react-native';

// ── Helpers ───────────────────────────────────────────
function stateColor(state?: string): 'green' | 'blue' | 'orange' | 'gray' {
  switch (state) {
    case 'charging':
      return 'green';
    case 'driving':
      return 'blue';
    case 'updating':
      return 'orange';
    default:
      return 'gray';
  }
}

function stateLabel(state?: string): string {
  if (!state) return 'Unknown';
  return state.charAt(0).toUpperCase() + state.slice(1);
}

// ── Mini stat card ────────────────────────────────────
const StatCard = ({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = '#8e8e93',
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: any;
  iconColor?: string;
}) => (
  <GlassCard className="flex-1 p-4">
    <View className="flex-row items-center mb-2">
      <Icon size={14} color={iconColor} />
      <Text style={{ fontSize: 11, color: '#636366', fontWeight: '600', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#f5f5f5' }}>{value}</Text>
      {unit && (
        <Text style={{ fontSize: 12, color: '#636366', marginLeft: 3 }}>{unit}</Text>
      )}
    </View>
  </GlassCard>
);

// ── Charging banner ───────────────────────────────────
const ChargingBanner = ({ details }: { details: any }) => (
  <GlassCard className="mx-4 mb-4 p-5 border-tesla-green/20" style={{ borderColor: 'rgba(48, 209, 88, 0.2)' }}>
    <View className="flex-row items-center mb-4">
      <View style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', padding: 8, borderRadius: 10, marginRight: 10 }}>
        <Zap size={18} color="#30d158" fill="#30d158" />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#30d158' }}>Charging</Text>
    </View>

    <View className="flex-row flex-wrap">
      <View style={{ width: '50%', marginBottom: 12 }}>
        <Text style={{ fontSize: 10, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Power</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#f5f5f5' }}>
          {details?.charger_power ?? 0}
          <Text style={{ fontSize: 13, color: '#636366' }}> kW</Text>
        </Text>
      </View>
      <View style={{ width: '50%', marginBottom: 12, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 10, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Time Left</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#f5f5f5' }}>
          {details?.time_to_full_charge ? `${details.time_to_full_charge.toFixed(1)}` : '--'}
          <Text style={{ fontSize: 13, color: '#636366' }}> hrs</Text>
        </Text>
      </View>
      <View style={{ width: '50%' }}>
        <Text style={{ fontSize: 10, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Added</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#f5f5f5' }}>
          {details?.charge_energy_added?.toFixed(1) ?? 0}
          <Text style={{ fontSize: 13, color: '#636366' }}> kWh</Text>
        </Text>
      </View>
      <View style={{ width: '50%', alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 10, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>V / A</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#f5f5f5' }}>
          {details?.charger_voltage ?? 0}
          <Text style={{ fontSize: 13, color: '#636366' }}>V</Text>
          {' / '}
          {details?.charger_actual_current ?? 0}
          <Text style={{ fontSize: 13, color: '#636366' }}>A</Text>
        </Text>
      </View>
    </View>
  </GlassCard>
);

// ── Main Dashboard ────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const {
    data: cars,
    isLoading: loadingCars,
    refetch: refetchCars,
  } = useQuery({ queryKey: ['cars'], queryFn: fetchCars });

  const car = cars?.[0];

  const {
    data: status,
    isLoading: loadingStatus,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ['car-status', car?.car_id],
    queryFn: () => fetchCarStatus(car!.car_id),
    enabled: !!car,
    refetchInterval: 30000,
  });

  const wakeMutation = useMutation({
    mutationFn: () => wakeUp(car!.car_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['car-status', car?.car_id] }),
  });

  const onRefresh = React.useCallback(() => {
    refetchCars();
    if (car) refetchStatus();
  }, [car, refetchCars, refetchStatus]);

  // ── Loading state ──
  if (loadingCars) {
    return <DashboardSkeleton />;
  }

  // ── No car state ──
  if (!car) {
    return (
      <View className="flex-1 bg-surface-primary items-center justify-center px-8" style={{ paddingTop: insets.top }}>
        <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: 20, borderRadius: 24, marginBottom: 20 }}>
          <Navigation size={40} color="#3b82f6" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#f5f5f5', marginBottom: 8, textAlign: 'center' }}>
          No cars found
        </Text>
        <Text style={{ fontSize: 15, color: '#8e8e93', textAlign: 'center', lineHeight: 22 }}>
          Make sure your TeslaMate API URL and Token are configured correctly in Settings.
        </Text>
      </View>
    );
  }

  const isCharging = status?.charging_details?.charging_state === 'charging';
  const batteryLevel = status?.battery_details?.battery_level ?? 0;
  const rangeKm = status?.battery_details?.ideal_battery_range?.toFixed(0);

  return (
    <ScrollView
      className="flex-1 bg-surface-primary"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={loadingStatus}
          onRefresh={onRefresh}
          tintColor="#636366"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View className="px-5 mb-2">
        <View className="flex-row justify-between items-start">
          <View>
            <Text style={{ fontSize: 14, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
              Your Tesla
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#f5f5f5', marginTop: 2 }}>
              {car.name}
            </Text>
          </View>
          <StatusBadge label={stateLabel(status?.state)} color={stateColor(status?.state)} />
        </View>
      </View>

      {/* ── Battery Ring ── */}
      <View className="items-center my-6">
        <BatteryRing
          level={batteryLevel}
          size={210}
          strokeWidth={12}
          isCharging={isCharging}
          rangeText={rangeKm ? `${rangeKm} km range` : undefined}
        />
      </View>

      {/* ── Charging banner ── */}
      {isCharging && <ChargingBanner details={status?.charging_details} />}

      {/* ── Stat grid ── */}
      <View className="px-4 mb-3 flex-row gap-3">
        <StatCard
          title="Inside"
          value={status?.climate_details?.inside_temp?.toFixed(1) ?? '--'}
          unit="°C"
          icon={Thermometer}
          iconColor="#ff9f0a"
        />
        <StatCard
          title="Outside"
          value={status?.climate_details?.outside_temp?.toFixed(1) ?? '--'}
          unit="°C"
          icon={Thermometer}
          iconColor="#3b82f6"
        />
      </View>

      <View className="px-4 mb-3 flex-row gap-3">
        <StatCard
          title="Odometer"
          value={status?.odometer ? Math.round(status.odometer).toLocaleString() : '--'}
          unit="km"
          icon={Navigation}
        />
        <StatCard
          title="Security"
          value={status?.car_status?.locked ? 'Locked' : 'Unlocked'}
          icon={status?.car_status?.locked ? Lock : Unlock}
          iconColor={status?.car_status?.locked ? '#30d158' : '#ff9f0a'}
        />
      </View>

      {/* ── Location ── */}
      <View className="px-4 mb-4">
        <GlassCard className="p-4 flex-row items-center">
          <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: 10, borderRadius: 12, marginRight: 12 }}>
            <MapPin size={20} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text style={{ fontSize: 10, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
              Location
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#f5f5f5' }} numberOfLines={1}>
              {status?.car_geodata?.latitude && status?.car_geodata?.longitude
                ? `${status.car_geodata.latitude.toFixed(4)}, ${status.car_geodata.longitude.toFixed(4)}`
                : 'Unknown'}
            </Text>
          </View>
        </GlassCard>
      </View>

      {/* ── Sentry + Wake ── */}
      <View className="px-4 flex-row gap-3">
        <GlassCard className="flex-1 p-4 flex-row items-center">
          <Shield size={18} color={status?.car_status?.sentry_mode ? '#30d158' : '#636366'} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#f5f5f5', marginLeft: 8 }}>
            Sentry {status?.car_status?.sentry_mode ? 'On' : 'Off'}
          </Text>
        </GlassCard>

        <TouchableOpacity
          className="flex-1"
          onPress={() => wakeMutation.mutate()}
          disabled={wakeMutation.isPending}
          activeOpacity={0.7}
        >
          <GlassCard className="p-4 flex-row items-center justify-center" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <Power size={18} color="#3b82f6" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6', marginLeft: 8 }}>
              {wakeMutation.isPending ? 'Waking…' : 'Wake Up'}
            </Text>
          </GlassCard>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
