import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/utils/firebase";
import { registerForPushNotificationsAsync } from "./src/utils/notifications";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // 1. Listen for Auth State
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        registerForPushNotificationsAsync();
      }
    });

    // 2. Handle Foreground Notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Received:", notification);
    });

    // 3. Handle Notification Clicks
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification Clicked:", response);
    });

    return () => {
      unsubscribe();
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
