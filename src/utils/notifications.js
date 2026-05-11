import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { auth, db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  // CRITICAL: Remote notifications are NOT supported in Expo Go for Android (SDK 53+)
  if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
    console.warn("Push Notifications are disabled: Not supported in Expo Go on Android. Use a Development Build to test.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.log("EAS Project ID not found. Push tokens may not work in development without EAS configuration.");
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Push Token:", token);

      // Save token to user profile if logged in
      if (auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          pushToken: token,
        });
      }
    } catch (e) {
      console.error("Error fetching push token", e);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
};
