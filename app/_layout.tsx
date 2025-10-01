import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import NotificationManager from '@/utils/notificationManager';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialize notifications when app loads
    const initNotifications = async () => {
      const notificationManager = NotificationManager.getInstance();
      await notificationManager.requestPermissions();
      notificationManager.setupNotificationListeners();
    };

    initNotifications();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
