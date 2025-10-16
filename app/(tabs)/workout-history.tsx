import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';
import {
  WorkoutSession,
  clearWorkoutSessions,
} from '@/utils/workoutSessionManager';
import { theme } from '@/styles/theme';

export default function WorkoutHistoryScreen() {
  const { sessions, stats, isLoading, refresh } = useWorkoutSessions();
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Refresh when screen comes into focus
    refresh();
  }, []);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Workout History',
      'Are you sure you want to delete all workout history? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            const success = await clearWorkoutSessions();
            if (success) {
              await refresh();
              Alert.alert('Success', 'Workout history cleared successfully');
            } else {
              Alert.alert('Error', 'Failed to clear workout history');
            }
            setIsClearing(false);
          },
        },
      ]
    );
  };

  const formatWorkoutType = (type: string) => {
    // Since we only have steps now, return a friendly name
    return type === 'steps'
      ? 'Walking Steps'
      : type
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWorkoutIcon = (
    type: string
  ): keyof typeof MaterialIcons.glyphMap => {
    // Only steps workout now
    return 'directions-walk';
  };

  const getWorkoutUnit = (type: string) => {
    // Return appropriate unit
    return type === 'steps' ? 'steps' : 'reps';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const StatCard = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <MaterialIcons name={icon} size={24} color="white" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const HistoryItem = ({ item }: { item: WorkoutSession }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}>
        <MaterialIcons
          name={getWorkoutIcon(item.workoutType)}
          size={24}
          color="#6366f1"
        />
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyTitle}>{item.alarmTitle}</Text>
        <Text style={styles.historySubtitle}>
          {item.completed}/{item.target} {getWorkoutUnit(item.workoutType)} •{' '}
          {formatDuration(item.duration)}
        </Text>
        <Text style={styles.historyDate}>{formatDate(item.completedAt)}</Text>
      </View>
      <View style={styles.historyBadge}>
        <MaterialIcons
          name={item.wasCompleted ? 'check-circle' : 'cancel'}
          size={20}
          color={item.wasCompleted ? '#10b981' : '#ef4444'}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Workout History</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor="#6366f1"
          />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="directions-walk"
              label="Total Alarms"
              value={stats.totalWorkouts}
              color="#6366f1"
            />
            <StatCard
              icon="trending-up"
              label="Steps Walked"
              value={stats.totalExercises.toLocaleString()}
              color="#10b981"
            />
            <StatCard
              icon="percent"
              label="Avg Completion"
              value={`${stats.averageCompletion}%`}
              color="#f59e0b"
            />
            <StatCard
              icon="local-fire-department"
              label="Current Streak"
              value={`${stats.streak} day${stats.streak !== 1 ? 's' : ''}`}
              color="#ef4444"
            />
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {sessions.length > 0 && (
              <TouchableOpacity
                onPress={handleClearHistory}
                disabled={isClearing}
                style={styles.clearButton}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color={isClearing ? '#cbd5e1' : '#ef4444'}
                />
              </TouchableOpacity>
            )}
          </View>
          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="directions-walk" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No workouts yet</Text>
              <Text style={styles.emptySubtitle}>
                Complete your first walking alarm to see your history here
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {sessions.map((item, index) => (
                <HistoryItem key={item.id || index} item={item} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Styles with Poppins font
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.semibold,
    color: 'white',
    textAlign: 'center',
  },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20 },
  statsSection: { marginTop: 20, marginBottom: 30 },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.semibold,
    color: '#1e293b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.bold,
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  historySection: { marginBottom: 30 },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  historyList: { gap: 12 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyContent: { flex: 1 },
  historyTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.semibold,
    color: '#1e293b',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748b',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#94a3b8',
  },
  historyBadge: { marginLeft: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.semibold,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
});
