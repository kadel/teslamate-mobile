import React from 'react';
import { RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { fetchCars, fetchDrives, Drive } from '@/lib/api';
import { Navigation, Clock, Zap, History, ChevronRight } from 'lucide-react-native';

const DriveItem = ({ drive }: { drive: Drive }) => {
  const router = useRouter();
  const startDate = new Date(drive.start_date);
  
  return (
    <TouchableOpacity 
      className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4 border border-gray-100 dark:border-gray-800 flex-row items-center"
      onPress={() => router.push(`/drive/${drive.drive_id}`)}
    >
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase">
            {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">
            {drive.consumption_net ? `${drive.consumption_net.toFixed(0)} Wh/km` : '-- Wh/km'}
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <View className="flex-row items-center">
            <Navigation size={14} color="#6b7280" />
            <Text className="ml-1 font-bold">{drive.odometer_details.odometer_distance?.toFixed(1)} km</Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={14} color="#6b7280" />
            <Text className="ml-1 font-bold">{drive.duration_min} min</Text>
          </View>
          <View className="flex-row items-center">
            <Zap size={14} color="#6b7280" />
            <Text className="ml-1 font-bold">{drive.energy_consumed_net?.toFixed(1)} kWh</Text>
          </View>
        </View>

        <View className="space-y-2 border-t border-gray-50 dark:border-gray-800 pt-3">
          <View className="flex-row items-start mb-2">
            <View className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2" />
            <Text className="text-xs text-gray-600 dark:text-gray-400 flex-1" numberOfLines={1}>
              {drive.start_address || 'Unknown location'}
            </Text>
          </View>
          <View className="flex-row items-start">
            <View className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2" />
            <Text className="text-xs text-gray-600 dark:text-gray-400 flex-1" numberOfLines={1}>
              {drive.end_address || 'Unknown location'}
            </Text>
          </View>
        </View>
      </View>
      <View className="ml-2">
        <ChevronRight size={20} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );
};

export default function ActivityScreen() {
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

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <Text>Loading drives...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black p-4">
      <Text className="text-2xl font-bold mb-6 mt-4">Recent Drives</Text>
      <FlatList
        data={drives}
        keyExtractor={(item) => item.drive_id.toString()}
        renderItem={({ item }) => <DriveItem drive={item} />}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <History size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-4">No recent drives found</Text>
          </View>
        }
      />
    </View>
  );
}
