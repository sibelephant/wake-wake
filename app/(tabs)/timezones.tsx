import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Line } from 'react-native-svg';

interface TimeZone {
  city: string;
  country: string;
  time: string;
  date: string;
  offset: number;
  isActive?: boolean;
}

export default function TimeZonesScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeZones, setTimeZones] = useState<TimeZone[]>([
    { 
      city: 'New York', 
      country: 'Thu, 10/07', 
      time: '17:02', 
      date: 'Thu, 10/07',
      offset: -4,
      isActive: true 
    },
    { 
      city: 'London', 
      country: 'Thu, 10/07', 
      time: '22:02', 
      date: 'Thu, 10/07',
      offset: 1,
      isActive: true 
    },
    { 
      city: 'Barcelona', 
      country: 'Thu, 10/07', 
      time: '23:02', 
      date: 'Thu, 10/07',
      offset: 2,
      isActive: true 
    },
    { 
      city: 'Toronto', 
      country: '', 
      time: '', 
      date: '',
      offset: -4,
      isActive: false 
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      updateTimeZones(now);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateTimeZones = (baseTime: Date) => {
    setTimeZones(prev => prev.map(zone => {
      if (!zone.isActive) return zone;
      
      const zoneTime = new Date(baseTime.getTime() + (zone.offset * 60 * 60 * 1000));
      return {
        ...zone,
        time: zoneTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        date: zoneTime.toLocaleDateString('en-US', {
          weekday: 'short',
          month: '2-digit',
          day: '2-digit'
        })
      };
    }));
  };

  const ClockFace = () => {
    const hours = currentTime.getHours() % 12;
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    
    const hourAngle = (hours * 30) + (minutes * 0.5) - 90;
    const minuteAngle = (minutes * 6) - 90;
    const secondAngle = (seconds * 6) - 90;

    const hourX = 80 + (45 * Math.cos(hourAngle * Math.PI / 180));
    const hourY = 80 + (45 * Math.sin(hourAngle * Math.PI / 180));
    const minuteX = 80 + (65 * Math.cos(minuteAngle * Math.PI / 180));
    const minuteY = 80 + (65 * Math.sin(minuteAngle * Math.PI / 180));
    const secondX = 80 + (60 * Math.cos(secondAngle * Math.PI / 180));
    const secondY = 80 + (60 * Math.sin(secondAngle * Math.PI / 180));

    return (
      <View style={styles.clockContainer}>
        <Svg height="160" width="160" style={styles.clockSvg}>
          {/* Outer circle */}
          <Circle cx="80" cy="80" r="75" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) - 90;
            const isMainHour = i % 3 === 0;
            const innerRadius = isMainHour ? 60 : 65;
            const outerRadius = 70;
            
            const x1 = 80 + (innerRadius * Math.cos(angle * Math.PI / 180));
            const y1 = 80 + (innerRadius * Math.sin(angle * Math.PI / 180));
            const x2 = 80 + (outerRadius * Math.cos(angle * Math.PI / 180));
            const y2 = 80 + (outerRadius * Math.sin(angle * Math.PI / 180));
            
            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={isMainHour ? "3" : "1"}
              />
            );
          })}
          
          {/* Minute dots */}
          {[...Array(60)].map((_, i) => {
            if (i % 5 !== 0) { // Skip hour positions
              const angle = (i * 6) - 90;
              const x = 80 + (68 * Math.cos(angle * Math.PI / 180));
              const y = 80 + (68 * Math.sin(angle * Math.PI / 180));
              
              return (
                <Circle
                  key={`dot-${i}`}
                  cx={x}
                  cy={y}
                  r="1"
                  fill="rgba(255,255,255,0.4)"
                />
              );
            }
            return null;
          })}
          
          {/* Clock hands */}
          <Line x1="80" y1="80" x2={hourX} y2={hourY} stroke="white" strokeWidth="4" strokeLinecap="round" />
          <Line x1="80" y1="80" x2={minuteX} y2={minuteY} stroke="white" strokeWidth="3" strokeLinecap="round" />
          <Line x1="80" y1="80" x2={secondX} y2={secondY} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          
          {/* Center dot */}
          <Circle cx="80" cy="80" r="5" fill="white" />
        </Svg>
      </View>
    );
  };

  const TimeZoneCard = ({ zone }: { zone: TimeZone }) => (
    <View style={[styles.timezoneCard, !zone.isActive && styles.inactiveCard]}>
      <View style={styles.timezoneInfo}>
        <Text style={[styles.cityName, !zone.isActive && styles.inactiveText]}>{zone.city}</Text>
        {zone.isActive && <Text style={styles.countryText}>{zone.date}</Text>}
      </View>
      {zone.isActive ? (
        <Text style={styles.timezoneTime}>{zone.time}</Text>
      ) : (
        <MaterialIcons name="access-time" size={24} color="#94a3b8" />
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Time zones</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-horiz" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.clockSection}>
        <ClockFace />
        <Text style={styles.currentTime}>
          {currentTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </Text>
        <Text style={styles.currentDate}>
          {currentTime.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric'
          })}
        </Text>
      </View>

      <View style={styles.timezonesSection}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {timeZones.map((zone, index) => (
            <TimeZoneCard key={index} zone={zone} />
          ))}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
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
    paddingVertical: 20,
  },
  clockContainer: {
    marginBottom: 20,
  },
  clockSvg: {
    // SVG styles handled by component
  },
  currentTime: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  currentDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  timezonesSection: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 20,
  },
  timezoneCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  inactiveCard: {
    backgroundColor: '#f1f5f9',
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
  inactiveText: {
    color: '#94a3b8',
  },
  countryText: {
    fontSize: 14,
    color: '#64748b',
  },
  timezoneTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
});