import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../utils/storage";

const PlanEventScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    launchDate: "",
    targetCount: "",
  });

  // Safety Checklist
  const [checks, setChecks] = useState({
    audienceVerified: false,
    contentReviewed: false,
    apiConnected: false,
    budgetApproved: false,
  });

  const isSafetyComplete = Object.values(checks).every((val) => val === true);

  const validateStep1 = () => {
    if (!eventData.title.trim()) {
      Alert.alert("Input Error", "Please provide a name for this campaign.");
      return false;
    }
    
    // Basic date validation (YYYY-MM-DD HH:MM)
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!dateRegex.test(eventData.launchDate)) {
      Alert.alert("Date Error", "Please enter a date in YYYY-MM-DD HH:MM format.");
      return false;
    }

    const targetDate = new Date(eventData.launchDate.replace(' ', 'T')).getTime();
    if (isNaN(targetDate) || targetDate <= Date.now()) {
      Alert.alert("Time Error", "Launch time must be in the future.");
      return false;
    }

    return true;
  };

  const handleSchedule = async () => {
    if (!isSafetyComplete) {
      Alert.alert("Safety Warning", "All safety checks must be cleared before this event can be scheduled.");
      return;
    }

    setLoading(true);
    const newEvent = {
      ...eventData,
      status: "Scheduled",
      checks,
    };

    const saved = await storage.saveBlast(newEvent);

    setLoading(false);
    if (saved) {
      Alert.alert("Success", "Event is now scheduled and the countdown has begun.", [
        { text: "View Dashboard", onPress: () => navigation.navigate("Dashboard") },
      ]);
    } else {
      Alert.alert("Error", "Failed to initialize launch timer. Please try again.");
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <Text style={styles.label}>Campaign Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Q4 Product Launch"
            value={eventData.title}
            onChangeText={(t) => setEventData({ ...eventData, title: t })}
          />
          <Text style={styles.label}>Launch Date/Time</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM"
            value={eventData.launchDate}
            onChangeText={(t) => setEventData({ ...eventData, launchDate: t.trim() })}
          />
          <Text style={styles.formatNote}>Format: 2026-12-31 14:00 (24hr)</Text>
          
          <Pressable 
            style={styles.primaryButton} 
            onPress={() => { if (validateStep1()) setStep(2); }}
          >
            <Text style={styles.primaryButtonText}>Continue to Safety Check</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Safety Preparation</Text>
        <Text style={styles.stepDescription}>
          Verify the following requirements to unlock the launch timer.
        </Text>

        <View style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Audience Verified</Text>
            <Text style={styles.checkSub}>Database has been scrubbed for errors.</Text>
          </View>
          <Switch
            value={checks.audienceVerified}
            onValueChange={(v) => setChecks({ ...checks, audienceVerified: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </View>

        <View style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Content Reviewed</Text>
            <Text style={styles.checkSub}>Copy and media approved by stakeholders.</Text>
          </View>
          <Switch
            value={checks.contentReviewed}
            onValueChange={(v) => setChecks({ ...checks, contentReviewed: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </View>

        <View style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>API Connectivity</Text>
            <Text style={styles.checkSub}>External providers are responding.</Text>
          </View>
          <Switch
            value={checks.apiConnected}
            onValueChange={(v) => setChecks({ ...checks, apiConnected: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </View>

        <View style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Budget Approved</Text>
            <Text style={styles.checkSub}>Spend limits for this event are authorized.</Text>
          </View>
          <Switch
            value={checks.budgetApproved}
            onValueChange={(v) => setChecks({ ...checks, budgetApproved: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </View>

        <Pressable
          style={[styles.scheduleButton, (!isSafetyComplete || loading) && styles.disabledButton]}
          onPress={handleSchedule}
          disabled={!isSafetyComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isSafetyComplete ? "🚀 Initialize Countdown" : "Checks Incomplete"}
            </Text>
          )}
        </Pressable>
        
        <Pressable style={styles.backLink} onPress={() => setStep(1)} disabled={loading}>
          <Text style={styles.backLinkText}>Edit Details</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Plan New Event</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>{renderStep()}</ScrollView>
    </View>
  );
};

export default PlanEventScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    backgroundColor: "#1A1F3A",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  closeButton: { padding: 5 },
  closeButtonText: { color: "#FFF", fontSize: 20 },
  content: { padding: 25 },
  section: { width: "100%" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#1A1F3A", marginBottom: 10 },
  stepDescription: { fontSize: 14, color: "#95A5A6", marginBottom: 30 },
  label: { fontSize: 14, fontWeight: "600", color: "#2C3E50", marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  checkLabel: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
  checkSub: { fontSize: 12, color: "#95A5A6", marginTop: 2 },
  primaryButton: {
    backgroundColor: "#1A1F3A",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 30,
  },
  scheduleButton: {
    backgroundColor: "#FF9900",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#FF9900",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: { backgroundColor: "#BDC3C7", shadowOpacity: 0, elevation: 0 },
  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  formatNote: { fontSize: 11, color: "#95A5A6", marginTop: 5, marginLeft: 5 },
  backLink: { marginTop: 20, alignItems: "center" },
  backLinkText: { color: "#95A5A6", fontWeight: "600" },
});
