import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SetupScreen from "../screens/SetupScreen";
import PlanEventScreen from "../screens/PlanEventScreen";
import RecordResultScreen from "../screens/RecordResultScreen";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Setup" component={SetupScreen} />
      <Stack.Screen 
        name="PlanEvent" 
        component={PlanEventScreen} 
        options={{ presentation: "modal" }}
      />
      <Stack.Screen 
        name="RecordResult" 
        component={RecordResultScreen} 
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
