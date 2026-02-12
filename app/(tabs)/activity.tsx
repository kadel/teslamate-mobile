import React, { useMemo } from 'react';
import { RefreshControl, SectionList, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Themed';
import { GlassCard } from '@/components/ui/GlassCard';
import { ActivitySkeleton } from '@/components/ui/Skeleton';
import { fetchCars, fetchDrives, Drive } from '@/lib/api';
import { Navigation, Clock, Zap, History, ChevronRight } from 'lucide-react-native';

// ── Date grouping helpers ─────────────────────────────
function dateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const driveDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (today.getTime() - driveDay.getTime()) / 86400000;

  if (diff < 1) return 'Today';
  if (diff < 2) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

interface Section {
  title: string;
  data: Drive[];
}

function groupDrivesByDate(drives: Drive[]): Section[] {
  const groups: Record<string, Drive[]> = {};
  for (const drive of drives) {
    const label = dateLabel(drive.start_date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(drive);
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

// ── Drive card ────────────────────────────────────────
const DriveCard = ({ drive }: { drive: Drive }) => {
  const router = useRouter();
  const startDate = new Date(drive.start_date);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/drive/${drive.drive_id}`)}
    >
      <GlassCard className="mb-3 p-4 flex-row items-center">
        <View className="flex-1">
          {/* Time + efficiency */}
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#f5f5f5' }}>
              {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#3b82f6' }}>
              {drive.consumption_net ? `${drive.consumption_net.toFixed(0)} Wh/km` : ''}
            </Text>
          </View>

          {/* Stats row */}
          <View className="flex-row mb-3" style={{ gap: 16 }}>
            <View className="flex-row items-center">
              <Navigation size={13} color="#636366" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#8e8e93', marginLeft: 4 }}>
                {drive.odometer_details.odometer_distance?.toFixed(1)} km
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={13} color="#636366" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#8e8e93', marginLeft: 4 }}>
                {drive.duration_min} min
              </Text>
            </View>
            <View className="flex-row items-center">
              <Zap size={13} color="#636366" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#8e8e93', marginLeft: 4 }}>
                {drive.energy_consumed_net?.toFixed(1)} kWh
              </Text>
            </View>
          </View>

          {/* Route visualization */}
          <View style={{ borderTopWidth: 0.5, borderTopColor: '#1c1c1e', paddingTop: 10 }}>
            <View className="flex-row items-center mb-1.5">
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#30d158', marginRight: 8 }} />
              <Text style={{ fontSize: 12, color: '#8e8e93', flex: 1 }} numberOfLines={1}>
                {drive.start_address || 'Unknown'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#ff453a', marginRight: 8 }} />
              <Text style={{ fontSize: 12, color: '#8e8e93', flex: 1 }} numberOfLines={1}>
                {drive.end_address || 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        <ChevronRight size={18} color="#3a3a3c" style={{ marginLeft: 8 }} />
      </GlassCard>
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────
export default function ActivityScreen() {
  const insets = useSafeAreaInsets();

  const { data: cars } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchCars,
  });

  const car = cars?.[0];

  const { data: drives, isLoading, refetch } = useQuery({
    queryKey: ['drives', car?.car_id],
    queryFn: () => fetchDrives(car!.car_id),
    enabled: !!car,
  });

  const sections = useMemo(() => groupDrivesByDate(drives ?? []), [drives]);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  return (
    <View className="flex-1 bg-surface-primary">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.drive_id.toString()}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 32 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#636366', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 8 }}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => <DriveCard drive={item} />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#636366" />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#f5f5f5', marginBottom: 16 }}>
            Activity
          </Text>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: 20, borderRadius: 24, marginBottom: 16 }}>
              <History size={36} color="#3b82f6" />
            </View>
            <Text style={{ fontSize: 17, fontWeight: '600', color: '#f5f5f5', marginBottom: 6 }}>
              No drives yet
            </Text>
            <Text style={{ fontSize: 14, color: '#8e8e93', textAlign: 'center' }}>
              Your recent drives will appear here once TeslaMate records them.
            </Text>
          </View>
        }
      />
    </View>
  );
}
