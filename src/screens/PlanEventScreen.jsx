import React, { useState, useEffect } from "react";
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
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Storage Configuration Layer
import { storage } from "../utils/storage";

const PlanEventScreen = () => {
  const navigation = useNavigation();

  // Wizard Navigation Step Tracking
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Controlled Form Inputs Data Layout
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    launchDate: "",
    targetArea: "",
    blastSize: "",
    holeCount: "",
    explosiveType: "",
  });

  // Mandatory Safety Checklist Engine
  const [checks, setChecks] = useState({
    exclusionZoneCleared: false,
    sirenTested: false,
    patternInspected: false,
    guardsPositioned: false,
  });

  // Evaluate if full authorization parameters are met
  const isSafetyComplete = Object.values(checks).every((val) => val === true);

  // Profile mount lifecycle side-effect hook
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await storage.getUserData();
    setUserData(data);
    
    // RBAC Permission Check
    if (data && !storage.canManageBlasts(data)) {
      displayAlert("Access Denied", "You do not have permission to plan blasts.");
      navigation.goBack();
    }
  };

  // Cross-Platform Unified Alert System Wrapper (Web / Native Viewports)
  const displayAlert = (title, message, actions) => {
    if (Platform.OS === "web") {
      alert(`${title}\n\n${message}`);
      if (actions && actions[0] && actions[0].onPress) {
        actions[0].onPress();
      }
    } else {
      Alert.alert(title, message, actions);
    }
  };

  // Step 1 Validation Rules Verification Engine
  const validateStep1 = () => {
    if (!eventData.title.trim() || !eventData.targetArea.trim()) {
      displayAlert("Input Error", "Please provide a name and target area for this blast.");
      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!dateRegex.test(eventData.launchDate)) {
      displayAlert("Date Error", "Please enter a date in YYYY-MM-DD HH:MM format.");
      return false;
    }

    // Explicit space normalization for standardized ISO construction
    const sanitizedDateString = eventData.launchDate.replace(/\s+/g, "T");
    const targetDate = new Date(sanitizedDateString).getTime();

    if (isNaN(targetDate) || targetDate <= Date.now()) {
      displayAlert("Time Error", "Blast time must be in the future.");
      return false;
    }

    return true;
  };

  // Cloud Write-back Initialization Handler
  const handleSchedule = async () => {
    if (!isSafetyComplete) {
      displayAlert("Safety Warning", "All safety checks must be cleared before this blast can be scheduled.");
      return;
    }

    setLoading(true);
    try {
      const newEvent = {
        ...eventData,
        holeCount: Number(eventData.holeCount) || 0,
        blastSize: Number(eventData.blastSize) || 0,
        status: "Scheduled",
        checks,
      };

      const saved = await storage.saveBlast(newEvent);

      if (saved) {
        displayAlert("Success", "Blast is now scheduled and the countdown has begun.", [
          {
            text: "View Dashboard",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "Dashboard" }],
              }),
          },
        ]);
      } else {
        throw new Error("Cloud synchronization failed.");
      }
    } catch (e) {
      console.error("Scheduling error:", e);
      displayAlert("Error", "Failed to initialize blast timer. Please check your data layout.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Multi-Step Component Renderer
  const renderStep = () => {
    if (step === 1) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blast Details</Text>
          
          <Text style={styles.label}>Operation Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bench 450 North"
            value={eventData.title}
            onChangeText={(t) => setEventData({ ...eventData, title: t })}
          />

          <Text style={styles.label}>Target Area/Level</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Level 22, West Wall"
            value={eventData.targetArea}
            onChangeText={(t) => setEventData({ ...eventData, targetArea: t })}
          />

          <View style={{ flexDirection: "row", gap: 15 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Hole Count</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={eventData.holeCount}
                onChangeText={(t) => setEventData({ ...eventData, holeCount: t })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Size (m²)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={eventData.blastSize}
                onChangeText={(t) => setEventData({ ...eventData, blastSize: t })}
              />
            </View>
          </View>

          <Text style={styles.label}>Blast Date/Time</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM"
            value={eventData.launchDate}
            onChangeText={(t) => setEventData({ ...eventData, launchDate: t })}
          />
          <Text style={styles.formatNote}>Format: 2026-12-31 14:00 (24hr)</Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              if (validateStep1()) setStep(2);
            }}
          >
            <Text style={styles.primaryButtonText}>Continue to Safety Check</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Safety Protocol</Text>
        <Text style={styles.stepDescription}>
          Verify the following requirements to unlock the detonation timer.
        </Text>

        {/* Exclusion Zone Clearance Option */}
        <View style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Exclusion Zone Cleared</Text>
            <Text style={styles.checkSub}>All personnel and equipment evacuated.</Text>
          </View>
          <Switch
            value={checks.exclusionZoneCleared}
            onValueChange={(v) => setChecks({ ...checks, exclusionZoneCleared: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </View>

        {/* Siren System Check Option */}
        <View style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Siren & Warning Tested</Text>
            <Text style={styles.checkSub}>Audible warning signals are functional.</Text>
          </View>
          <Switch
            value={checks.sirenTested}
            onValueChange={(v) => setChecks({ ...checks, sirenTested: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </View>

        {/* Engineering Pattern Inspection Option */}
        <View style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Pattern Inspected</Text>
            <Text style={styles.checkSub}>Charging and tie-ins verified by supervisor.</Text>
          </View>
          <Switch
            value={checks.patternInspected}
            onValueChange={(v) => setChecks({ ...checks, patternInspected: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </View>

        {/* Periphery Guard Posts Option */}
        <View style={styles.checkItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkLabel}>Guards Positioned</Text>
            <Text style={styles.checkSub}>Access points secured and monitored.</Text>
          </View>
          <Switch
            value={checks.guardsPositioned}
            onValueChange={(v) => setChecks({ ...checks, guardsPositioned: v })}
            trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
          />
        </View>

        {/* Process Final Submit Trigger */}
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
      {/* Dynamic Header Toolbar Wrap */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Plan New Event</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>
    </View>
  );
};

export default PlanEventScreen;

// Style sheet Rule Declarations
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
    color: "#2C3E50",
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