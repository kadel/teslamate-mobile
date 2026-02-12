import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LineChart } from 'react-native-chart-kit';
import { Text, View } from '@/components/Themed';
import { fetchCars, fetchDriveDetails } from '@/lib/api';
import { ChevronLeft, Navigation, Clock, Zap, Thermometer, TrendingUp, TrendingDown, Activity as ActivityIcon } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 64; // Adjusting for more horizontal padding buffer

const StatRow = ({ label, value, unit, icon: Icon }: { label: string; value: string | number; unit?: string; icon: any }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
    <View className="flex-row items-center">
      <View className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mr-3">
        <Icon size={16} color="#6b7280" />
      </View>
      <Text className="text-gray-500 dark:text-gray-400 font-medium">{label}</Text>
    </View>
    <View className="flex-row items-baseline">
      <Text className="text-lg font-bold">{value}</Text>
      {unit && <Text className="text-gray-400 text-xs ml-1">{unit}</Text>}
    </View>
  </View>
);

const ChartSection = ({ title, data, color, unit, min }: { title: string; data: number[]; color: string; unit: string; min?: number }) => {
  if (data.length < 2) return null;
  
  // Downsample if too many points for better performance
  const processedData = useMemo(() => {
    if (data.length <= 20) return data;
    const step = Math.ceil(data.length / 20);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  return (
    <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm mb-6">
      <Text className="text-lg font-bold mb-4">{title}</Text>
      <LineChart
        data={{
          labels: [],
          datasets: [{ data: processedData }]
        }}
        width={chartWidth}
        height={180}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => color,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '0' }, // Hide dots for cleaner look
          propsForBackgroundLines: { strokeDasharray: '' }, // Solid lines
          paddingLeft: 40, // More room for labels
        }}
        bezier
        fromZero={min === undefined}
        style={{ marginVertical: 8, borderRadius: 16, marginLeft: -15 }} // Slight left shift to balance

        yAxisSuffix={unit}
      />
    </View>
  );
};

export default function DriveDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
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
      speed: drive.drive_details.map(d => d.speed),
      power: drive.drive_details.map(d => d.power),
      elevation: drive.drive_details.map(d => d.elevation).filter(e => e !== null),
      tempInside: drive.drive_details.map(d => d.climate_info.inside_temp).filter(t => t !== null) as number[],
      tempOutside: drive.drive_details.map(d => d.climate_info.outside_temp).filter(t => t !== null) as number[],
      battery: drive.drive_details.map(d => d.battery_level),
    };
  }, [drive]);

  if (isLoading || !drive) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black">
        <ActivityIcon size={32} color="#3b82f6" className="animate-spin mb-4" />
        <Text>Loading drive details...</Text>
      </View>
    );
  }

  const startDate = new Date(drive.start_date);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <Stack.Screen 
        options={{ 
          title: 'Trip Details',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-4 pl-4">
              <ChevronLeft size={24} color="#3b82f6" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView className="flex-1 p-4">
        {/* Header Info */}
        <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm mb-6">
          <Text className="text-gray-400 font-bold uppercase text-xs mb-1">
            {startDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text className="text-2xl font-bold mb-6">
            {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} Trip
          </Text>

          <View className="space-y-1">
            <StatRow label="Distance" value={drive.odometer_details.odometer_distance.toFixed(1)} unit="km" icon={Navigation} />
            <StatRow label="Duration" value={drive.duration_min} unit="min" icon={Clock} />
            <StatRow label="Energy Used" value={drive.energy_consumed_net?.toFixed(1) ?? '--'} unit="kWh" icon={Zap} />
            <StatRow label="Efficiency" value={drive.consumption_net?.toFixed(0) ?? '--'} unit="Wh/km" icon={TrendingDown} />
            <StatRow label="Avg Speed" value={Math.round(drive.speed_avg ?? 0)} unit="km/h" icon={TrendingUp} />
          </View>
        </View>

        {/* Graphs */}
        {chartData && (
          <>
            <ChartSection title="Speed" data={chartData.speed} color="#3b82f6" unit=" km/h" />
            <ChartSection title="Power" data={chartData.power} color="#ef4444" unit=" kW" />
            <ChartSection title="Elevation" data={chartData.elevation} color="#10b981" unit=" m" />
            <ChartSection title="Battery Level" data={chartData.battery} color="#8b5cf6" unit=" %" />
            {chartData.tempInside.length > 1 && (
              <ChartSection title="Inside Temperature" data={chartData.tempInside} color="#f59e0b" unit=" °C" />
            )}
          </>
        )}

        {/* Route Info */}
        <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm mb-10">
          <Text className="text-lg font-bold mb-4">Route</Text>
          <View className="flex-row items-start mb-6">
            <View className="items-center mr-4">
              <View className="w-4 h-4 rounded-full border-4 border-green-500 bg-white" />
              <View className="w-0.5 h-12 bg-gray-100 dark:bg-gray-800" />
              <View className="w-4 h-4 rounded-full border-4 border-red-500 bg-white" />
            </View>
            <View className="flex-1 justify-between h-20 py-0.5">
              <View>
                <Text className="text-gray-400 text-xs font-bold uppercase">Start</Text>
                <Text className="font-semibold text-sm" numberOfLines={1}>{drive.start_address || 'Unknown'}</Text>
              </View>
              <View>
                <Text className="text-gray-400 text-xs font-bold uppercase">Destination</Text>
                <Text className="font-semibold text-sm" numberOfLines={1}>{drive.end_address || 'Unknown'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
