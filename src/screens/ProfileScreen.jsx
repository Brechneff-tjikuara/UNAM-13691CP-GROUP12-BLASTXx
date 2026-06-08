import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// Configuration, Storage and Assets
import { storage } from "../utils/storage";
import logo from "../../assets/icon.png";

const ProfileScreen = () => {
  const navigation = useNavigation();

  // State Management
  const [userData, setUserData] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lifecycle Methods
  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      setLoading(true);
      const data = await storage.getUserData();

      if (!isMounted) return;
      setUserData(data);

      if (data) {
        const team = await storage.getTeammates();
        if (isMounted) setTeammates(team);
      }
      if (isMounted) setLoading(false);
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Event Handlers
  const handleLogout = () => {
    // Shared log-out code module execution sequence
    const executeLogout = async () => {
      await storage.clearAll();
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    };

    // Cross-platform condition to handle both web-view tabs and mobile components
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Are you sure you want to logout? This will clear your local cache.");
      if (confirmLogout) {
        executeLogout();
      }
    } else {
      Alert.alert(
        "Logout",
        "Are you sure you want to logout? This will clear your local cache.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            onPress: executeLogout,
            style: "destructive",
          },
        ]
      );
    }
  };

  // Loading View
  if (loading && !userData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

  // Component UI Render Blocks
  const renderTeammember = (member, index) => (
    <View style={styles.teammateItem} key={member.uid || index.toString()}>
      <View style={styles.teammateAvatar}>
        <Text style={styles.teammateInitial}>{member.name?.charAt(0) || "U"}</Text>
      </View>
      <View style={styles.teammateInfo}>
        <Text style={styles.teammateName}>{member.name}</Text>
        <Text style={styles.teammateEmail}>{member.email}</Text>
      </View>
      {member.uid === userData?.uid && (
        <View style={styles.youBadge}>
          <Text style={styles.youText}>YOU</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Team</Text>
        <Pressable onPress={() => navigation.navigate("Dashboard")} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Dashboard</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Company Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={logo} style={styles.avatarImage} />
          </View>
          <Text style={styles.userName}>{userData?.company?.name || "Your Company"}</Text>
          <Text style={styles.userEmail}>
            Code: <Text style={styles.highlightText}>{userData?.companyCode}</Text>
          </Text>

          <View style={styles.userStatsContainer}>
            <View style={styles.userStat}>
              <Text style={styles.userStatValue}>{teammates.length}</Text>
              <Text style={styles.userStatLabel}>Teammates</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatValue}>{userData?.company?.industry || "N/A"}</Text>
              <Text style={styles.userStatLabel}>Industry</Text>
            </View>
          </View>
        </View>

        {/* Teammates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teammates ({teammates.length})</Text>
          {teammates.map((member, index) => renderTeammember(member, index))}
        </View>

        {/* Administration Section */}
        {userData?.role === "admin" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administration</Text>
            <Pressable
              style={styles.settingsItem}
              onPress={() => navigation.navigate("AdminPanel")}
            >
              <Text style={styles.settingsItemIcon}>🛡️</Text>
              <Text style={styles.adminLinkText}>Manage Team & Roles</Text>
            </Pressable>
          </View>
        )}


        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Pressable style={styles.settingsItem} onPress={handleLogout}>
            <Text style={styles.settingsItemIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout from BlastX</Text>
          </Pressable>
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

// Stylesheets
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centerContent: { justifyContent: "center" },
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
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  backButtonText: { color: "#FFF", fontSize: 12 },
  content: { flex: 1, padding: 15 },
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F0F3F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarImage: { width: 50, height: 50, borderRadius: 10 },
  avatar: { fontSize: 30 },
  userName: { fontSize: 20, fontWeight: "bold", color: "#2C3E50" },
  userEmail: { fontSize: 14, color: "#95A5A6", marginTop: 5 },
  highlightText: { fontWeight: "bold", color: "#FF9900" },
  userStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
    paddingTop: 20,
    marginTop: 20,
  },
  userStat: { alignItems: "center" },
  userStatValue: { fontSize: 16, fontWeight: "bold", color: "#2C3E50" },
  userStatLabel: { fontSize: 11, color: "#95A5A6", marginTop: 3 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2C3E50", marginBottom: 15, marginLeft: 5 },
  teammateItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", padding: 12, borderRadius: 12, marginBottom: 8, gap: 12 },
  teammateAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1A1F3A", justifyContent: "center", alignItems: "center" },
  teammateInitial: { color: "#FFF", fontWeight: "bold" },
  teammateInfo: { flex: 1 },
  teammateName: { fontSize: 14, fontWeight: "600", color: "#2C3E50" },
  teammateEmail: { fontSize: 12, color: "#95A5A6" },
  youBadge: { backgroundColor: "#E8F4FD", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  youText: { fontSize: 10, fontWeight: "bold", color: "#3498DB" },
  settingsItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", padding: 15, borderRadius: 12, gap: 12 },
  settingsItemIcon: { fontSize: 18 },
  adminLinkText: { fontSize: 14, fontWeight: "bold", color: "#FF9900" },
  logoutText: { fontSize: 14, fontWeight: "bold", color: "#E74C3C" },
  footerSpacing: { height: 40 },
});