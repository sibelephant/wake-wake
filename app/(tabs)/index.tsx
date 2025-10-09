import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { AlarmCard } from '@/components';
import { useAlarms } from '@/hooks';
import { theme } from '@/styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AlarmsScreen() {
  const { alarms, loading, loadAlarms, toggleAlarm, deleteAlarm } = useAlarms();

  // Load alarms when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [loadAlarms])
  );

  // 🧪 Debug function for testing
  const debugStorage = async () => {
    const data = await AsyncStorage.getItem('alarms');
    console.log('=== PHASE 1 DEBUG ===');
    console.log('Raw AsyncStorage:', data);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('Parsed alarms:', parsed);
      console.log('Total count:', parsed.length);
      parsed.forEach((alarm: any, idx: number) => {
        console.log(`Alarm ${idx + 1}:`, {
          title: alarm.title,
          time: alarm.time,
          enabled: alarm.enabled,
          days: alarm.days,
        });
      });
    } else {
      console.log('No alarms in storage');
    }
    console.log('==================');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alarms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-alarm')}
        >
          <MaterialIcons name="add" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading alarms...</Text>
          </View>
        ) : alarms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="alarm-off" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No alarms yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to create your first alarm
            </Text>
          </View>
        ) : (
          alarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onToggle={toggleAlarm}
              onPress={(id) => router.push(`/edit-alarm/${id}`)}
              onLongPress={deleteAlarm}
            />
          ))
        )}

        {/* 🧪 Debug Button for Testing */}
        {__DEV__ && (
          <TouchableOpacity style={styles.debugButton} onPress={debugStorage}>
            <MaterialIcons name="bug-report" size={20} color="#ffffff" />
            <Text style={styles.debugButtonText}>Debug Storage</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  emptySubtext: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
