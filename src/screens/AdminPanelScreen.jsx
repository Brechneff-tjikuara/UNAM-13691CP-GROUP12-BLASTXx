import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../utils/storage";
import { auth } from "../utils/firebase";

const AdminPanelScreen = () => {
  const navigation = useNavigation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
<<<<<<< HEAD
  const [rbacEnabled, setRbacEnabled] = useState(true);
=======
>>>>>>> 6888ba485e53225e77ef5712c45f1bd0c01cfc13

  useEffect(() => {
    fetchMembers();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const data = await storage.getUserData();
    setCurrentUser(data);
<<<<<<< HEAD
    if (data?.company) {
      setRbacEnabled(data.company.rbacEnabled !== false);
    }
  };

  const handleToggleRBAC = async () => {
    const newValue = !rbacEnabled;
    const success = await storage.toggleRBAC(currentUser.companyCode, newValue);
    if (success) {
      setRbacEnabled(newValue);
      Alert.alert("Success", `Role-Based Access is now ${newValue ? "Enabled" : "Disabled"}. Members will need to refresh their app.`);
    } else {
      Alert.alert("Error", "Failed to update RBAC settings.");
    }
=======
>>>>>>> 6888ba485e53225e77ef5712c45f1bd0c01cfc13
  };

  const fetchMembers = async () => {
    setLoading(true);
    const data = await storage.getTeammates();
    setMembers(data);
    setLoading(false);
  };

  const handlePromote = (member) => {
    Alert.alert(
      "Promote Member",
      `Are you sure you want to promote ${member.name} to Admin?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Promote", 
          onPress: async () => {
            const success = await storage.promoteMember(member.uid);
            if (success) {
              Alert.alert("Success", `${member.name} is now an admin.`);
              fetchMembers();
            } else {
              Alert.alert("Error", "Failed to promote member.");
            }
          }
        }
      ]
    );
  };

  const handleDemote = (member) => {
    if (member.uid === auth.currentUser.uid) {
      Alert.alert("Error", "You cannot demote yourself.");
      return;
    }

    Alert.alert(
      "Demote Member",
      `Are you sure you want to demote ${member.name} to Member?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Demote", 
          onPress: async () => {
            const success = await storage.demoteMember(member.uid);
            if (success) {
              Alert.alert("Success", `${member.name} is now a member.`);
              fetchMembers();
            } else {
              Alert.alert("Error", "Failed to demote member.");
            }
          }
        }
      ]
    );
  };

  const handleRemove = (member) => {
    if (member.uid === auth.currentUser.uid) {
      Alert.alert("Error", "You cannot remove yourself.");
      return;
    }

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${member.name} from the team?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            const success = await storage.removeMember(member.uid);
            if (success) {
              Alert.alert("Success", `${member.name} has been removed.`);
              fetchMembers();
            } else {
              Alert.alert("Error", "Failed to remove member.");
            }
          }
        }
      ]
    );
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        <View style={[styles.roleBadge, item.role === "admin" ? styles.adminBadge : styles.memberBadge]}>
          <Text style={styles.roleText}>{item.role?.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {item.role === "member" ? (
          <Pressable style={styles.actionButton} onPress={() => handlePromote(item)}>
            <Text style={styles.promoteText}>Promote</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.actionButton} onPress={() => handleDemote(item)}>
            <Text style={styles.demoteText}>Demote</Text>
          </Pressable>
        )}
        <Pressable style={styles.actionButton} onPress={() => handleRemove(item)}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Admin Panel</Text>
      </View>

<<<<<<< HEAD
      <View style={styles.settingsSection}>
        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Role-Based Access (RBAC)</Text>
            <Text style={styles.settingDesc}>Limit blast creation/editing to specific roles.</Text>
          </View>
          <Pressable 
            style={[styles.toggleBtn, rbacEnabled ? styles.toggleOn : styles.toggleOff]} 
            onPress={handleToggleRBAC}
          >
            <Text style={styles.toggleText}>{rbacEnabled ? "ON" : "OFF"}</Text>
          </Pressable>
        </View>
      </View>

=======
>>>>>>> 6888ba485e53225e77ef5712c45f1bd0c01cfc13
      {loading ? (
        <ActivityIndicator size="large" color="#FF9900" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.uid}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
<<<<<<< HEAD
          ListHeaderComponent={<Text style={styles.listTitle}>Manage Team</Text>}
=======
>>>>>>> 6888ba485e53225e77ef5712c45f1bd0c01cfc13
          ListEmptyComponent={
            <Text style={styles.emptyText}>No members found.</Text>
          }
        />
      )}
    </View>
  );
};

export default AdminPanelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#2C3E50",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
<<<<<<< HEAD
  settingsSection: {
    backgroundColor: "#FFF",
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1F3A",
  },
  settingDesc: {
    fontSize: 12,
    color: "#95A5A6",
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  toggleOn: {
    backgroundColor: "#2ECC71",
  },
  toggleOff: {
    backgroundColor: "#E74C3C",
  },
  toggleText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1F3A",
    marginBottom: 15,
=======
  listContent: {
    padding: 20,
>>>>>>> 6888ba485e53225e77ef5712c45f1bd0c01cfc13
  },
  memberCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    marginBottom: 10,
  },
  memberName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1F3A",
  },
  memberEmail: {
    fontSize: 14,
    color: "#95A5A6",
    marginBottom: 5,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadge: {
    backgroundColor: "#FF9900",
  },
  memberBadge: {
    backgroundColor: "#3498DB",
  },
  roleText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
    justifyContent: "flex-end",
    gap: 15,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  promoteText: {
    color: "#2ECC71",
    fontWeight: "bold",
  },
  demoteText: {
    color: "#F1C40F",
    fontWeight: "bold",
  },
  removeText: {
    color: "#E74C3C",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#95A5A6",
    marginTop: 50,
    fontSize: 16,
  },
});
