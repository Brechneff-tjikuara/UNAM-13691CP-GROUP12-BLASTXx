import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/utils/firebase";
import AppNavigator from "./src/navigation/AppNavigator";




// Basic Error Boundary for Web/Native Stability
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("App Crash:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong.</Text>
          <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // Listen for Auth State
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user.uid);
      }
    });

    
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
  },
  
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 10,
  },
  
  errorText: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
  },
});
