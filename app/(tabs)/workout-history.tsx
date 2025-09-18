import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface WorkoutHistoryItem {
  alarmId: string;
  completedAt: string;
  workoutType: string;
  target: number;
  completed: number;
  duration: number;
}

export default function WorkoutHistoryScreen() {
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    averageCompletion: 0,
    streak: 0,
  });

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem('workoutHistory');
      if (historyData) {
        const parsedHistory = JSON.parse(historyData);
        setHistory(parsedHistory.reverse()); // Show most recent first
        calculateStats(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading workout history:', error);
    }
  };

  const calculateStats = (historyData: WorkoutHistoryItem[]) => {
    const totalWorkouts = historyData.length;
    const totalExercises = historyData.reduce((sum, item) => sum + item.completed, 0);
    const averageCompletion = totalWorkouts > 0 
      ? Math.round((historyData.reduce((sum, item) => sum + (item.completed / item.target), 0) / totalWorkouts) * 100)
      : 0;
    
    // Calculate current streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < historyData.length; i++) {
      const workoutDate = new Date(historyData[i].completedAt);
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    setStats({
      totalWorkouts,
      totalExercises,
      averageCompletion,
      streak,
    });
  };

  const formatWorkoutType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'jumping-jacks': return 'accessibility';
      case 'push-ups': return 'fitness-center';
      case 'sit-ups': return 'self-improvement';
      case 'squats': return 'directions-run';
      case 'burpees': return 'sports-gymnastics';
      case 'steps': return 'directions-walk';
      case 'plank': return 'timer';
      case 'mountain-climbers': return 'terrain';
      default: return 'fitness-center';
    }
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <MaterialIcons name={icon} size={24} color="white" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const HistoryItem = ({ item }: { item: WorkoutHistoryItem }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}>
        <MaterialIcons 
          name={getWorkoutIcon(item.workoutType)} 
          size={24} 
          color="#6366f1" 
        />
      </View>
      
      <View style={styles.historyContent}>
        <Text style={styles.historyTitle}>
          {formatWorkoutType(item.workoutType)}
        </Text>
        <Text style={styles.historySubtitle}>
          {item.completed}/{item.target} completed
        </Text>
        <Text style={styles.historyDate}>
          {formatDate(item.completedAt)}
        </Text>
      </View>
      
      <View style={styles.historyBadge}>
        <MaterialIcons 
          name={item.completed >= item.target ? "check-circle" : "radio-button-unchecked"} 
          size={20} 
          color={item.completed >= item.target ? "#10b981" : "#94a3b8"} 
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout History</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="fitness-center"
              label="Total Workouts"
              value={stats.totalWorkouts}
              color="#6366f1"
            />
            <StatCard
              icon="trending-up"
              label="Exercises Done"
              value={stats.totalExercises}
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
              value={`${stats.streak} days`}
              color="#ef4444"
            />
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="fitness-center" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No workouts yet</Text>
              <Text style={styles.emptySubtitle}>
                Complete your first alarm workout to see your history here
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.map((item, index) => (
                <HistoryItem key={index} item={item} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
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
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  historySection: {
    marginBottom: 30,
  },
  historyList: {
    gap: 12,
  },
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
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  historyBadge: {
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
});