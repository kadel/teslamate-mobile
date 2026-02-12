import React, { useMemo } from 'react';
import { RefreshControl, SectionList, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { GlassCard } from '@/components/ui/GlassCard';
import { ActivitySkeleton } from '@/components/ui/Skeleton';
import { fetchCars, fetchCharges, Charge } from '@/lib/api';
import { Battery, Clock, Zap, Coins, ChevronRight } from 'lucide-react-native';

// ── Date grouping helpers ─────────────────────────────
function dateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const chargeDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (today.getTime() - chargeDay.getTime()) / 86400000;

  if (diff < 1) return 'Today';
  if (diff < 2) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

interface Section {
  title: string;
  data: Charge[];
}

function groupChargesByDate(charges: Charge[]): Section[] {
  const groups: Record<string, Charge[]> = {};
  for (const charge of charges) {
    const label = dateLabel(charge.start_date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(charge);
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

// ── Charge card ───────────────────────────────────────
const ChargeCard = ({ charge }: { charge: Charge }) => {
  const router = useRouter();
  const startDate = new Date(charge.start_date);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/charge/${charge.charge_id}`)}
    >
      <GlassCard className="mb-3 p-4 flex-row items-center">
        <View className="flex-1">
          {/* Address + time */}
          <View className="flex-row justify-between items-center mb-2">
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#f5f5f5', flex: 1 }} numberOfLines={1}>
              {charge.address || 'Unknown Location'}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#3b82f6', marginLeft: 8 }}>
              {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {/* Battery range */}
          <View className="flex-row items-center mb-3">
            <Battery size={13} color="#30d158" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#8e8e93', marginLeft: 4 }}>
              {charge.battery_details.start_battery_level}% → {charge.battery_details.end_battery_level}%
            </Text>
          </View>

          {/* Stats row */}
          <View style={{ borderTopWidth: 0.5, borderTopColor: '#1c1c1e', paddingTop: 10 }}>
            <View className="flex-row" style={{ gap: 16 }}>
              <View className="flex-row items-center">
                <Zap size={13} color="#636366" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#8e8e93', marginLeft: 4 }}>
                  {charge.charge_energy_added?.toFixed(1)} kWh
                </Text>
              </View>
              <View className="flex-row items-center">
                <Clock size={13} color="#636366" />
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#8e8e93', marginLeft: 4 }}>
                  {charge.duration_min} min
                </Text>
              </View>
              {charge.cost != null && charge.cost > 0 && (
                <View className="flex-row items-center">
                  <Coins size={13} color="#636366" />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#8e8e93', marginLeft: 4 }}>
                    {charge.cost.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <ChevronRight size={18} color="#3a3a3c" style={{ marginLeft: 8 }} />
      </GlassCard>
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────
export default function ChargesScreen() {
  const insets = useSafeAreaInsets();

  const { data: cars } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchCars,
  });

  const car = cars?.[0];

  const { data: charges, isLoading, refetch } = useQuery({
    queryKey: ['charges', car?.car_id],
    queryFn: () => fetchCharges(car!.car_id),
    enabled: !!car,
  });

  const sections = useMemo(() => groupChargesByDate(charges ?? []), [charges]);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  return (
    <View className="flex-1 bg-surface-primary">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.charge_id.toString()}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 32 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#636366', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 8 }}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => <ChargeCard charge={item} />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#636366" />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#f5f5f5', marginBottom: 16 }}>
            Charges
          </Text>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View style={{ backgroundColor: 'rgba(48, 209, 88, 0.15)', padding: 20, borderRadius: 24, marginBottom: 16 }}>
              <Zap size={36} color="#30d158" />
            </View>
            <Text style={{ fontSize: 17, fontWeight: '600', color: '#f5f5f5', marginBottom: 6 }}>
              No charges yet
            </Text>
            <Text style={{ fontSize: 14, color: '#8e8e93', textAlign: 'center' }}>
              Your charging sessions will appear here once TeslaMate records them.
            </Text>
          </View>
        }
      />
    </View>
  );
}
