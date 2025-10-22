import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMEZONES_KEY = 'saved_timezones';

// Major cities around the world with their timezones
const MAJOR_CITIES = [
  // United States
  {
    city: 'New York',
    country: 'USA',
    timezone: 'America/New_York',
    offset: -5,
  },
  {
    city: 'Los Angeles',
    country: 'USA',
    timezone: 'America/Los_Angeles',
    offset: -8,
  },
  { city: 'Chicago', country: 'USA', timezone: 'America/Chicago', offset: -6 },
  { city: 'Houston', country: 'USA', timezone: 'America/Chicago', offset: -6 },
  { city: 'Phoenix', country: 'USA', timezone: 'America/Phoenix', offset: -7 },
  { city: 'Miami', country: 'USA', timezone: 'America/New_York', offset: -5 },
  {
    city: 'Seattle',
    country: 'USA',
    timezone: 'America/Los_Angeles',
    offset: -8,
  },
  { city: 'Denver', country: 'USA', timezone: 'America/Denver', offset: -7 },

  // Europe
  { city: 'London', country: 'UK', timezone: 'Europe/London', offset: 0 },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris', offset: 1 },
  { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', offset: 1 },
  { city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid', offset: 1 },
  { city: 'Rome', country: 'Italy', timezone: 'Europe/Rome', offset: 1 },
  {
    city: 'Amsterdam',
    country: 'Netherlands',
    timezone: 'Europe/Amsterdam',
    offset: 1,
  },
  { city: 'Barcelona', country: 'Spain', timezone: 'Europe/Madrid', offset: 1 },
  { city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', offset: 3 },

  // Asia
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', offset: 9 },
  { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', offset: 4 },
  {
    city: 'Singapore',
    country: 'Singapore',
    timezone: 'Asia/Singapore',
    offset: 8,
  },
  {
    city: 'Hong Kong',
    country: 'China',
    timezone: 'Asia/Hong_Kong',
    offset: 8,
  },
  { city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', offset: 9 },
  { city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', offset: 7 },
  { city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', offset: 5.5 },
  { city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', offset: 8 },

  // Oceania
  {
    city: 'Sydney',
    country: 'Australia',
    timezone: 'Australia/Sydney',
    offset: 11,
  },
  {
    city: 'Melbourne',
    country: 'Australia',
    timezone: 'Australia/Melbourne',
    offset: 11,
  },
  {
    city: 'Auckland',
    country: 'New Zealand',
    timezone: 'Pacific/Auckland',
    offset: 13,
  },

  // Americas (others)
  {
    city: 'Toronto',
    country: 'Canada',
    timezone: 'America/Toronto',
    offset: -5,
  },
  {
    city: 'Vancouver',
    country: 'Canada',
    timezone: 'America/Vancouver',
    offset: -8,
  },
  {
    city: 'Mexico City',
    country: 'Mexico',
    timezone: 'America/Mexico_City',
    offset: -6,
  },
  {
    city: 'São Paulo',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    offset: -3,
  },
  {
    city: 'Buenos Aires',
    country: 'Argentina',
    timezone: 'America/Argentina/Buenos_Aires',
    offset: -3,
  },

  // Middle East & Africa
  { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', offset: 2 },
  {
    city: 'Istanbul',
    country: 'Turkey',
    timezone: 'Europe/Istanbul',
    offset: 3,
  },
  {
    city: 'Johannesburg',
    country: 'South Africa',
    timezone: 'Africa/Johannesburg',
    offset: 2,
  },
];

interface TimeZone {
  city: string;
  country: string;
  timezone: string;
  offset: number;
}

export default function TimeZonesScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [savedTimezones, setSavedTimezones] = useState<TimeZone[]>([]);
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    loadSavedTimezones();
  }, []);

  useEffect(() => {
    // Stop time updates when modal is open to prevent re-renders
    if (showCityPicker) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [showCityPicker]);

  const loadSavedTimezones = async () => {
    try {
      const stored = await AsyncStorage.getItem(TIMEZONES_KEY);
      if (stored) {
        setSavedTimezones(JSON.parse(stored));
      } else {
        // Default timezones
        const defaults = [
          MAJOR_CITIES.find((c) => c.city === 'New York')!,
          MAJOR_CITIES.find((c) => c.city === 'London')!,
          MAJOR_CITIES.find((c) => c.city === 'Tokyo')!,
        ];
        setSavedTimezones(defaults);
        await AsyncStorage.setItem(TIMEZONES_KEY, JSON.stringify(defaults));
      }
    } catch (error) {
      console.error('Error loading timezones:', error);
    }
  };

  const addTimezone = useCallback(async (timezone: TimeZone) => {
    setSavedTimezones((prevTimezones) => {
      // Check if already added
      if (prevTimezones.some((tz) => tz.city === timezone.city)) {
        Alert.alert(
          'Already Added',
          `${timezone.city} is already in your list`
        );
        return prevTimezones;
      }

      const updated = [...prevTimezones, timezone];
      AsyncStorage.setItem(TIMEZONES_KEY, JSON.stringify(updated));
      return updated;
    });
    setShowCityPicker(false);
  }, []);

  const removeTimezone = useCallback(async (city: string) => {
    Alert.alert('Remove City', `Remove ${city} from your timezones?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setSavedTimezones((prevTimezones) => {
            const updated = prevTimezones.filter((tz) => tz.city !== city);
            AsyncStorage.setItem(TIMEZONES_KEY, JSON.stringify(updated));
            return updated;
          });
        },
      },
    ]);
  }, []);

  const getTimeForTimezone = useCallback(
    (offset: number) => {
      const utc =
        currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
      const cityTime = new Date(utc + offset * 3600000);
      return cityTime;
    },
    [currentTime]
  );

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: '2-digit',
      day: '2-digit',
    });
  }, []);

  const ClockFace = () => {
    const hourAngle = (currentTime.getHours() % 12) * 30 - 90;
    const minuteAngle = currentTime.getMinutes() * 6 - 90;
    const secondAngle = currentTime.getSeconds() * 6 - 90;

    const hourX = 80 + 45 * Math.cos((hourAngle * Math.PI) / 180);
    const hourY = 80 + 45 * Math.sin((hourAngle * Math.PI) / 180);
    const minuteX = 80 + 65 * Math.cos((minuteAngle * Math.PI) / 180);
    const minuteY = 80 + 65 * Math.sin((minuteAngle * Math.PI) / 180);
    const secondX = 80 + 60 * Math.cos((secondAngle * Math.PI) / 180);
    const secondY = 80 + 60 * Math.sin((secondAngle * Math.PI) / 180);

    return (
      <View style={styles.clockContainer}>
        <Svg height="160" width="160">
          <Circle
            cx="80"
            cy="80"
            r="75"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          {[...Array(12)].map((_, i) => {
            const angle = i * 30 - 90;
            const innerRadius = i % 3 === 0 ? 60 : 65;
            const outerRadius = 70;
            const x1 = 80 + innerRadius * Math.cos((angle * Math.PI) / 180);
            const y1 = 80 + innerRadius * Math.sin((angle * Math.PI) / 180);
            const x2 = 80 + outerRadius * Math.cos((angle * Math.PI) / 180);
            const y2 = 80 + outerRadius * Math.sin((angle * Math.PI) / 180);
            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={i % 3 === 0 ? 3 : 1}
              />
            );
          })}
          <Line
            x1="80"
            y1="80"
            x2={hourX}
            y2={hourY}
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Line
            x1="80"
            y1="80"
            x2={minuteX}
            y2={minuteY}
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Line
            x1="80"
            y1="80"
            x2={secondX}
            y2={secondY}
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Circle cx="80" cy="80" r="5" fill="white" />
        </Svg>
      </View>
    );
  };

  const TimeZoneCard = ({ zone }: { zone: TimeZone }) => {
    const zoneTime = getTimeForTimezone(zone.offset);

    return (
      <View style={styles.timezoneCard}>
        <View style={styles.timezoneInfo}>
          <Text style={styles.cityName}>{zone.city}</Text>
          <Text style={styles.countryText}>
            {zone.country} • {formatDate(zoneTime)}
          </Text>
        </View>
        <Text style={styles.timezoneTime}>{formatTime(zoneTime)}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeTimezone(zone.city)}
        >
          <MaterialIcons name="close" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
    );
  };

  const CityItem = React.memo(
    ({
      item,
      onPress,
    }: {
      item: TimeZone;
      onPress: (item: TimeZone) => void;
    }) => {
      // Use a static snapshot of time for the modal to prevent flickering
      const staticTime = useMemo(() => {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const cityTime = new Date(utc + item.offset * 3600000);
        return cityTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }, [item.offset]);

      return (
        <TouchableOpacity style={styles.cityItem} onPress={() => onPress(item)}>
          <View style={styles.cityItemContent}>
            <Text style={styles.cityItemName}>{item.city}</Text>
            <Text style={styles.cityItemCountry}>{item.country}</Text>
          </View>
          <Text style={styles.cityItemTime}>{staticTime}</Text>
        </TouchableOpacity>
      );
    }
  );

  const handleAddCity = useCallback(
    (timezone: TimeZone) => {
      addTimezone(timezone);
    },
    [addTimezone]
  );

  const CityPickerModal = useMemo(() => {
    // Don't render modal content if not visible
    if (!showCityPicker) return null;

    return (
      <Modal
        visible={showCityPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCityPicker(false)}>
              <MaterialIcons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add City</Text>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            data={MAJOR_CITIES}
            keyExtractor={(item) => `${item.city}-${item.country}`}
            renderItem={({ item }) => (
              <CityItem item={item} onPress={handleAddCity} />
            )}
            contentContainerStyle={styles.cityList}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={15}
          />
        </View>
      </Modal>
    );
  }, [showCityPicker, handleAddCity]);

  return (
    <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Time zones</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCityPicker(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.clockSection}>
        <ClockFace />
        <Text style={styles.currentTime}>
          {currentTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>
        <Text style={styles.currentDate}>
          {currentTime.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.timezonesSection}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {savedTimezones.map((zone, index) => (
            <TimeZoneCard key={`${zone.city}-${index}`} zone={zone} />
          ))}

          {savedTimezones.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="public" size={64} color="#94a3b8" />
              <Text style={styles.emptyText}>No cities added</Text>
              <Text style={styles.emptySubtext}>
                Tap the + button to add cities
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {CityPickerModal}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  clockContainer: {
    marginBottom: 24,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  currentDate: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  timezonesSection: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  timezoneCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  timezoneInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  countryText: {
    fontSize: 14,
    color: '#64748b',
  },
  timezoneTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginRight: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  cityList: {
    paddingVertical: 8,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cityItemContent: {
    flex: 1,
  },
  cityItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  cityItemCountry: {
    fontSize: 14,
    color: '#64748b',
  },
  cityItemTime: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
});
