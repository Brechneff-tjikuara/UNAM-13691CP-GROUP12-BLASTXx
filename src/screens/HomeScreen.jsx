import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../utils/storage";
import logo from "../utils/assets/images/light icon (1).png";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    const isComplete = await storage.isSetupComplete();
    if (isComplete) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } else {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.heroTitle}>Reach your audience with BlastX</Text>
        <Text style={styles.heroDescription}>
          The most powerful automated blast scheduler for modern marketing
          teams.
        </Text>
      </View>

      {/* Simplified Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>📅</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureLabel}>Smart Scheduling</Text>
            <Text style={styles.featureSub}>Plan your campaigns weeks in advance.</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>📊</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureLabel}>Real-time Analytics</Text>
            <Text style={styles.featureSub}>Track open rates and engagement instantly.</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>🚀</Text>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureLabel}>Multi-channel Delivery</Text>
            <Text style={styles.featureSub}>Email, SMS, and Push in one single blast.</Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Pressable 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.primaryButtonText}>Get Started for Free</Text>
        </Pressable>
        <Pressable 
          style={styles.secondaryButton} 
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          BlastX © 2026 • Secure & Encrypted
        </Text>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 100,
    paddingBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1F3A",
    textAlign: "center",
    lineHeight: 40,
  },
  heroDescription: {
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 28,
    marginRight: 20,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1F3A",
  },
  featureSub: {
    fontSize: 13,
    color: "#95A5A6",
    marginTop: 2,
  },
  ctaSection: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#FF9900",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#FF9900",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1F3A",
  },
  footer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#BDC3C7",
  },
});
