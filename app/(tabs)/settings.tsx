import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, TouchableOpacity, ScrollView, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/Themed';
import { GlassCard } from '@/components/ui/GlassCard';
import { getApiUrl, setApiUrl, getApiToken, setApiToken } from '@/lib/store';
import { testConnection } from '@/lib/api';
import { Save, Wifi, WifiOff, Server, KeyRound, Info } from 'lucide-react-native';

type ConnectionState = 'idle' | 'testing' | 'success' | 'error';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);
  const [connState, setConnState] = useState<ConnectionState>('idle');
  const [connError, setConnError] = useState('');

  useEffect(() => {
    (async () => {
      setUrl(await getApiUrl());
      setToken((await getApiToken()) || '');
    })();
  }, []);

  const handleSave = useCallback(async () => {
    await setApiUrl(url.trim());
    await setApiToken(token.trim());
    // Invalidate all queries so they refetch with new credentials
    queryClient.invalidateQueries();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [url, token, queryClient]);

  const handleTestConnection = useCallback(async () => {
    setConnState('testing');
    setConnError('');
    try {
      // Save first so test uses latest values
      await setApiUrl(url.trim());
      await setApiToken(token.trim());
      await testConnection();
      setConnState('success');
    } catch (e: any) {
      setConnState('error');
      setConnError(e?.message || 'Connection failed');
    }
  }, [url, token]);

  return (
    <ScrollView
      className="flex-1 bg-surface-primary"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#f5f5f5', marginBottom: 24 }}>
        Settings
      </Text>

      {/* ── Server URL ── */}
      <GlassCard className="p-5 mb-3">
        <View className="flex-row items-center mb-4">
          <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: 8, borderRadius: 10, marginRight: 10 }}>
            <Server size={16} color="#3b82f6" />
          </View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#f5f5f5' }}>Server URL</Text>
        </View>
        <TextInput
          style={{
            backgroundColor: '#1c1c1e',
            padding: 14,
            borderRadius: 12,
            color: '#f5f5f5',
            fontSize: 15,
            borderWidth: 0.5,
            borderColor: '#2c2c2e',
          }}
          value={url}
          onChangeText={setUrl}
          placeholder="https://your-teslamate-api.com"
          placeholderTextColor="#636366"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </GlassCard>

      {/* ── API Token ── */}
      <GlassCard className="p-5 mb-4">
        <View className="flex-row items-center mb-4">
          <View style={{ backgroundColor: 'rgba(191, 90, 242, 0.15)', padding: 8, borderRadius: 10, marginRight: 10 }}>
            <KeyRound size={16} color="#bf5af2" />
          </View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#f5f5f5' }}>API Token</Text>
        </View>
        <TextInput
          style={{
            backgroundColor: '#1c1c1e',
            padding: 14,
            borderRadius: 12,
            color: '#f5f5f5',
            fontSize: 15,
            borderWidth: 0.5,
            borderColor: '#2c2c2e',
          }}
          value={token}
          onChangeText={setToken}
          placeholder="Your 32+ character token"
          placeholderTextColor="#636366"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </GlassCard>

      {/* ── Actions ── */}
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          className="flex-1"
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              borderRadius: 14,
              backgroundColor: saved ? '#30d158' : '#3b82f6',
            }}
          >
            <Save size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 8 }}>
              {saved ? 'Saved!' : 'Save'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1"
          onPress={handleTestConnection}
          disabled={connState === 'testing'}
          activeOpacity={0.7}
        >
          <GlassCard
            className="flex-row items-center justify-center p-4"
            style={{
              borderColor:
                connState === 'success'
                  ? 'rgba(48, 209, 88, 0.4)'
                  : connState === 'error'
                  ? 'rgba(255, 69, 58, 0.4)'
                  : '#2c2c2e',
            }}
          >
            {connState === 'success' ? (
              <Wifi size={18} color="#30d158" />
            ) : connState === 'error' ? (
              <WifiOff size={18} color="#ff453a" />
            ) : (
              <Wifi size={18} color="#8e8e93" />
            )}
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                marginLeft: 8,
                color:
                  connState === 'success'
                    ? '#30d158'
                    : connState === 'error'
                    ? '#ff453a'
                    : '#8e8e93',
              }}
            >
              {connState === 'testing' ? 'Testing…' : 'Test'}
            </Text>
          </GlassCard>
        </TouchableOpacity>
      </View>

      {/* ── Connection error message ── */}
      {connState === 'error' && connError ? (
        <GlassCard className="p-4 mb-6" style={{ borderColor: 'rgba(255, 69, 58, 0.3)' }}>
          <Text style={{ fontSize: 13, color: '#ff453a', lineHeight: 18 }}>{connError}</Text>
        </GlassCard>
      ) : null}

      {/* ── Info ── */}
      <GlassCard className="p-5">
        <View className="flex-row items-center mb-3">
          <Info size={16} color="#636366" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#636366', marginLeft: 8 }}>Setup Guide</Text>
        </View>
        <Text style={{ fontSize: 13, color: '#8e8e93', lineHeight: 20 }}>
          Point the Server URL to your TeslaMateApi instance. Make sure the API_TOKEN environment variable is set and is at least 32 characters long.
        </Text>
      </GlassCard>
    </ScrollView>
  );
}
