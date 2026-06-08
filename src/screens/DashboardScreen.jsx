import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// Configuration, Storage and Assets
import { storage } from "../utils/storage";
import logo from "../../assets/icon.png";

const DashboardScreen = () => {
  const navigation = useNavigation();

  // Core Data States
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  
  // Status States
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    failed: 0,
  });

  // Countdown State Engine
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", mins: "00" });

  // Real-time Event Subscription & Mounting Context
  useFocusEffect(
    useCallback(() => {
      let unsubscribeBlasts = () => {};

      const setupDashboard = async () => {
        setLoading(true);
        const data = await storage.getUserData();
        setUserData(data);

        // Subscribing to real-time changes inside company collection
        unsubscribeBlasts = storage.onBlastsUpdate((eData, metadata) => {
          setEvents(eData);
          updateStats(eData);
          setLoading(false);
          setIsSyncing(metadata?.hasPendingWrites || false);
        });
      };

      setupDashboard();

      return () => {
        if (unsubscribeBlasts) unsubscribeBlasts();
      };
    }, [])
  );

  // Background Live Ticker Calculation Engine for Launch Time
  useEffect(() => {
    if (!nextEvent || !nextEvent.launchDate) {
      setTimeLeft({ days: "00", hours: "00", mins: "00" });
      return;
    }

    const calculateTimeLeft = () => {
      const targetTime = new Date(nextEvent.launchDate).getTime();
      const currentTime = new Date().getTime();
      const difference = targetTime - currentTime;

      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", mins: "00" });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({
        days: days < 10 ? `0${days}` : `${days}`,
        hours: hours < 10 ? `0${hours}` : `${hours}`,
        mins: minutes < 10 ? `0${minutes}` : `${minutes}`,
      });
    };

    calculateTimeLeft(); // Run calculation instantly on reference match
    const intervalId = setInterval(calculateTimeLeft, 60000); // Poll computation every minute

    return () => clearInterval(intervalId);
  }, [nextEvent]);

  // UI Calculation Utilities
  const updateStats = (eData) => {
    const scheduled = eData.filter((e) => e.status === "Scheduled");
    if (scheduled.length > 0) {
      setNextEvent(scheduled[0]);
    } else {
      setNextEvent(null);
    }

    setStats({
      total: eData.length,
      scheduled: scheduled.length,
      completed: eData.filter((e) => e.status === "Completed").length,
      failed: eData.filter((e) => e.status === "Failed").length,
    });
  };

  // Live countdown background ticking processor
  useEffect(() => {
    if (!nextEvent?.launchDate) {
      setTimeLeft({ days: "00", hours: "00", mins: "00" });
      return;
    }

    const calculateTimeLeft = () => {
      // Replace spacing gaps with standard ISO 'T' layouts to guarantee stable cross-browser execution
      const standardizedDate = nextEvent.launchDate.replace(" ", "T");
      const targetTime = new Date(standardizedDate).getTime();
      const difference = targetTime - Date.now();

      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", mins: "00" });
        return;
      }

      // Time breakdown calculations
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({
        days: d < 10 ? `0${d}` : `${d}`,
        hours: h < 10 ? `0${h}` : `${h}`,
        mins: m < 10 ? `0${m}` : `${m}`,
      });
    };

    // Initialize timer immediately on hook evaluation loop to bypass layout lag
    calculateTimeLeft();

    // Re-verify difference values dynamically every single second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [nextEvent]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Loading Screen View
  if (loading && !userData) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header section wrapper */}
      <View style={styles.header}>
        <Image source={logo} style={styles.headerLogo} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {userData?.company?.name || "BlastX"}
          </Text>
          {isSyncing && (
            <Text style={styles.syncingText}>☁️ Syncing changes...</Text>
          )}
        </View>
        <Pressable onPress={() => navigation.navigate("Profile")} style={styles.profileIcon}>
          <Text style={styles.profileText}>👤</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Countdown Timer Card */}
        {nextEvent ? (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>NEXT LAUNCH: {nextEvent.title}</Text>
            <View style={styles.countdownContainer}>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{timeLeft.days}</Text>
                <Text style={styles.timeUnit}>Days</Text>
              </View>
              <Text style={styles.timeDivider}>:</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{timeLeft.hours}</Text>
                <Text style={styles.timeUnit}>Hrs</Text>
              </View>
              <Text style={styles.timeDivider}>:</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeValue}>{timeLeft.mins}</Text>
                <Text style={styles.timeUnit}>Mins</Text>
              </View>
            </View>
            <Text style={styles.launchDateText}>Target: {nextEvent.launchDate || "TBD"}</Text>
          </View>
        ) : (
          <View style={styles.emptyTimerCard}>
            <Text style={styles.emptyTimerText}>No Active Launch Timers</Text>
            <Text style={styles.emptyTimerSub}>Plan an event and clear safety checks to start.</Text>
          </View>
        )}

        {/* Quick Operational Status Block */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#1A1F3A" }]}>
            <Text style={styles.statNumber}>{stats.scheduled}</Text>
            <Text style={styles.statLabel}>Pending Blasts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FF9900" }]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Operations</Text>
          </View>
        </View>

        {/* Blast Operations Action Control */}
        {storage.canManageBlasts(userData) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Blast Control</Text>
            <Pressable
              style={[styles.actionButton, { backgroundColor: "#2ECC71" }]}
              onPress={() => navigation.navigate("PlanEvent")}
            >
              <Text style={styles.actionButtonIcon}>💥</Text>
              <Text style={styles.actionButtonText}>Plan New Blast</Text>
            </Pressable>
          </View>
        )}

        {/* Administrator Configuration Actions */}
        {userData?.role === "admin" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Management</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: "#FF9900", flex: 1 }]}
                onPress={() => navigation.navigate("AdminPanel")}
              >
                <Text style={styles.actionButtonIcon}>🛡️</Text>
                <Text style={styles.actionButtonText}>Members</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, { backgroundColor: "#1A1F3A", flex: 1 }]}
                onPress={() => navigation.navigate("Setup")}
              >
                <Text style={styles.actionButtonIcon}>⚙️</Text>
                <Text style={styles.actionButtonText}>Mine Setup</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Recent Operation Event Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Operations</Text>
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No operations recorded yet.</Text>
            </View>
          ) : (
            events.map((event) => (
              <Pressable
                key={event.id}
                style={styles.historyItem}
                onPress={() => {
                  if (event.status === "Scheduled") {
                    navigation.navigate("RecordResult", {
                      blastId: event.id,
                      blastTitle: event.title,
                    });
                  }
                }}
              >
                <View
                  style={[
                    styles.historyStatus,
                    { backgroundColor: event.status === "Scheduled" ? "#FF9900" : "#2ECC71" },
                  ]}
                >
                  <Text style={styles.historyStatusIcon}>
                    {event.status === "Scheduled" ? "⏳" : "✓"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>{event.title}</Text>
                  <Text style={styles.historyTime}>
                    {event.status === "Scheduled" ? "Scheduled" : "Completed"}: {formatDate(event.createdAt)}
                  </Text>
                </View>
                {event.status === "Scheduled" ? (
                  <View style={[styles.badge, { backgroundColor: "#E8F4FD" }]}>
                    <Text style={[styles.badgeText, { color: "#3498DB" }]}>Record Result</Text>
                  </View>
                ) : (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{event.status}</Text>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

// Stylesheets
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
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  headerLogo: { width: 30, height: 30, borderRadius: 6, marginRight: 12 },
  syncingText: { fontSize: 10, color: "#FF9900", marginTop: 2, fontWeight: "600" },
  profileIcon: { backgroundColor: "rgba(255,255,255,0.1)", padding: 8, borderRadius: 20 },
  profileText: { fontSize: 18 },
  content: { flex: 1, padding: 15 },
  timerCard: {
    backgroundColor: "#1A1F3A",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  timerLabel: { color: "#FF9900", fontWeight: "bold", fontSize: 12, letterSpacing: 1, marginBottom: 15 },
  countdownContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  timeBox: { alignItems: "center" },
  timeValue: { color: "#FFF", fontSize: 36, fontWeight: "bold" },
  timeUnit: { color: "#95A5A6", fontSize: 10, marginTop: -5 },
  timeDivider: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginTop: -15 },
  launchDateText: { color: "#95A5A6", fontSize: 12, marginTop: 20 },
  emptyTimerCard: {
    padding: 30,
    backgroundColor: "#FFF",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECF0F1",
    marginBottom: 20,
  },
  emptyTimerText: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
  emptyTimerSub: { fontSize: 12, color: "#95A5A6", marginTop: 5, textAlign: "center" },
  statsContainer: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2C3E50", marginBottom: 15 },
  actionButton: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 18,
    marginBottom: 10,
    alignItems: "center",
    gap: 12,
  },
  actionButtonText: { fontSize: 14, fontWeight: "bold", color: "#FFF" },
  actionButtonIcon: { fontSize: 20 },
  historyItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  historyStatus: { width: 35, height: 35, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  historyStatusIcon: { fontSize: 16 },
  historyTitle: { fontSize: 14, fontWeight: "bold", color: "#2C3E50" },
  historyTime: { fontSize: 12, color: "#95A5A6", marginTop: 2 },
  badge: { backgroundColor: "#F8F9FA", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#95A5A6" },
  emptyState: { padding: 30, alignItems: "center" },
  emptyStateText: { color: "#95A5A6", fontSize: 14 },
});