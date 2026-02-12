import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { getApiUrl, setApiUrl, getApiToken, setApiToken } from '@/lib/store';
import { Save } from 'lucide-react-native';

export default function SettingsScreen() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedUrl = await getApiUrl();
      const savedToken = await getApiToken();
      setUrl(savedUrl);
      setToken(savedToken || '');
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    await setApiUrl(url);
    await setApiToken(token);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-black p-4">
      <View className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm mb-6">
        <Text className="text-xl font-bold mb-6">API Configuration</Text>
        
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Server URL</Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
            value={url}
            onChangeText={setUrl}
            placeholder="http://your-teslamate-api.com"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-8">
          <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">API Token</Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
            value={token}
            onChangeText={setToken}
            placeholder="Your 32+ char token"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          className={`flex-row items-center justify-center p-4 rounded-xl ${saved ? 'bg-green-500' : 'bg-blue-600'}`}
          onPress={handleSave}
        >
          <Save size={20} color="white" className="mr-2" />
          <Text className="text-white font-bold ml-2">
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl">
        <Text className="text-blue-800 dark:text-blue-300 font-bold mb-2">Instructions</Text>
        <Text className="text-blue-700 dark:text-blue-400 leading-relaxed">
          Ensure your TeslaMateApi instance has the API_TOKEN environment variable set. 
          The token must be at least 32 characters long.
        </Text>
      </View>
    </ScrollView>
  );
}
