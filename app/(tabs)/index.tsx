import React from 'react';
import { ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from '@/components/Themed';
import { fetchCars, fetchCarStatus, wakeUp } from '@/lib/api';
import { Battery, Thermometer, MapPin, Lock, Unlock, Zap, Navigation } from 'lucide-react-native';

const StatusCard = ({ title, value, icon: Icon, unit }: { title: string; value: string | number; icon: any; unit?: string }) => (
  <View className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm w-[48%] mb-4">
    <View className="flex-row items-center mb-2">
      <Icon size={16} color="#3b82f6" />
      <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold ml-2 uppercase">{title}</Text>
    </View>
    <View className="flex-row items-baseline">
      <Text className="text-xl font-bold">{value}</Text>
      {unit && <Text className="text-gray-400 text-xs ml-1">{unit}</Text>}
    </View>
  </View>
);

export default function DashboardScreen() {
  const queryClient = useQueryClient();

  const { data: cars, isLoading: loadingCars, refetch: refetchCars } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchCars,
  });

  const car = cars?.[0];

  const { data: status, isLoading: loadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['car-status', car?.car_id],
    queryFn: () => fetchCarStatus(car!.car_id),
    enabled: !!car,
    refetchInterval: 30000,
  });

  const wakeMutation = useMutation({
    mutationFn: () => wakeUp(car!.car_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-status', car?.car_id] });
    },
  });

  const onRefresh = React.useCallback(() => {
    refetchCars();
    if (car) refetchStatus();
  }, [car, refetchCars, refetchStatus]);

  if (loadingCars) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <Text>Loading car data...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black p-6">
        <Text className="text-lg font-bold mb-2">No cars found</Text>
        <Text className="text-gray-500 text-center">
          Make sure your API URL and Token are correct in Settings.
        </Text>
      </View>
    );
  }

  const isCharging = status?.charging_details?.charging_state === 'charging';

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 dark:bg-black"
      refreshControl={<RefreshControl refreshing={loadingStatus} onRefresh={onRefresh} />}
    >
      <View className="bg-blue-600 p-6 rounded-b-[40px] shadow-lg mb-6">
        <View className="flex-row justify-between items-start mb-8">
          <View>
            <Text className="text-blue-100 text-sm font-bold uppercase tracking-widest">Your Tesla</Text>
            <Text className="text-white text-3xl font-bold">{car.name}</Text>
            <Text className="text-blue-200 text-sm capitalize">{status?.state || 'Status unknown'}</Text>
          </View>
          <View className="bg-blue-500/30 p-3 rounded-2xl">
            <Battery size={32} color="white" />
          </View>
        </View>

        <View className="flex-row items-end">
          <Text className="text-white text-6xl font-bold">{status?.battery_details?.battery_level ?? '--'}</Text>
          <Text className="text-blue-200 text-2xl font-bold mb-2 ml-1">%</Text>
          {isCharging && (
            <View className="ml-4 mb-2 flex-row items-center bg-green-400 px-3 py-1 rounded-full">
              <Zap size={14} color="white" />
              <Text className="text-white font-bold text-xs ml-1">Charging</Text>
            </View>
          )}
        </View>
        
        <View className="mt-6 flex-row justify-between items-center">
          <View>
            <Text className="text-blue-100 text-xs font-bold uppercase">Estimated Range</Text>
            <Text className="text-white text-lg font-bold">{status?.battery_details?.ideal_battery_range?.toFixed(0) ?? '--'} km</Text>
          </View>
          <TouchableOpacity 
            className="bg-white/20 px-6 py-3 rounded-full"
            onPress={() => wakeMutation.mutate()}
            disabled={wakeMutation.isPending}
          >
            <Text className="text-white font-bold">{wakeMutation.isPending ? 'Waking...' : 'Wake Up'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Charging Details Section */}
      {isCharging && (
        <View className="px-4 mb-6">
          <View className="bg-green-50 dark:bg-green-900/20 p-6 rounded-[32px] border border-green-100 dark:border-green-900/30">
            <View className="flex-row items-center mb-4">
              <View className="bg-green-500 p-2 rounded-full mr-3">
                <Zap size={18} color="white" />
              </View>
              <Text className="text-green-800 dark:text-green-400 font-bold text-lg">Charging Details</Text>
            </View>
            
            <View className="flex-row justify-between flex-wrap">
              <View className="w-1/2 mb-4">
                <Text className="text-green-700/60 dark:text-green-400/60 text-xs font-bold uppercase mb-1">Power</Text>
                <Text className="text-green-900 dark:text-green-100 text-xl font-bold">{status?.charging_details?.charger_power ?? 0} kW</Text>
              </View>
              <View className="w-1/2 mb-4">
                <Text className="text-green-700/60 dark:text-green-400/60 text-xs font-bold uppercase mb-1 text-right">Time Remaining</Text>
                <Text className="text-green-900 dark:text-green-100 text-xl font-bold text-right">
                  {status?.charging_details?.time_to_full_charge ? `${status.charging_details.time_to_full_charge.toFixed(1)} hrs` : '--'}
                </Text>
              </View>
              <View className="w-1/2">
                <Text className="text-green-700/60 dark:text-green-400/60 text-xs font-bold uppercase mb-1">Added</Text>
                <Text className="text-green-900 dark:text-green-100 text-xl font-bold">{status?.charging_details?.charge_energy_added?.toFixed(1) ?? 0} kWh</Text>
              </View>
              <View className="w-1/2">
                <Text className="text-green-700/60 dark:text-green-400/60 text-xs font-bold uppercase mb-1 text-right">Voltage / Current</Text>
                <Text className="text-green-900 dark:text-green-100 text-xl font-bold text-right">
                  {status?.charging_details?.charger_voltage ?? 0}V / {status?.charging_details?.charger_actual_current ?? 0}A
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className="px-4 flex-row flex-wrap justify-between">
        <StatusCard 
          title="Inside Temp" 
          value={status?.climate_details?.inside_temp?.toFixed(1) ?? '--'} 
          unit="°C" 
          icon={Thermometer} 
        />
        <StatusCard 
          title="Outside Temp" 
          value={status?.climate_details?.outside_temp?.toFixed(1) ?? '--'} 
          unit="°C" 
          icon={Thermometer} 
        />
        <StatusCard 
          title="Odometer" 
          value={status?.odometer ? Math.round(status.odometer).toLocaleString() : '--'} 
          unit="km" 
          icon={Navigation} 
        />
        <StatusCard 
          title="Status" 
          value={status?.car_status?.locked ? 'Locked' : 'Unlocked'} 
          icon={status?.car_status?.locked ? Lock : Unlock} 
        />
      </View>

      <View className="px-4 mb-10">
        <View className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm flex-row items-center">
          <View className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-xl mr-4">
            <MapPin size={24} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-400 uppercase">Current Location</Text>
            <Text className="text-gray-900 dark:text-white font-semibold" numberOfLines={1}>
              {status?.car_geodata?.latitude && status?.car_geodata?.longitude ? 
                `${status.car_geodata.latitude.toFixed(4)}, ${status.car_geodata.longitude.toFixed(4)}` : 
                'Location unknown'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
