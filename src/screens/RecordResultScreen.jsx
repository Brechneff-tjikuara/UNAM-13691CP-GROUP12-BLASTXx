import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

const RecordResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { blastId, blastTitle } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [resultData, setResultData] = useState({
    fragmentation: "",
    productivity: "",
    incidents: "None",
    notes: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await storage.getUserData();
    setUserData(data);
    
    if (data && !storage.canManageBlasts(data)) {
      Alert.alert("Access Denied", "You do not have permission to record blast results.");
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    if (!blastId || !userData) return;

    if (!storage.canManageBlasts(userData)) {
      Alert.alert("Error", "Unauthorized action.");
      return;
    }

    if (!resultData.fragmentation || !resultData.productivity) {
      displayAlert("Input Error", "Please provide fragmentation and productivity metrics.");
      return;
    }

    setLoading(true);
    try {
      const blastRef = doc(db, "companies", userData.companyCode, "blasts", blastId);
      await updateDoc(blastRef, {
        status: "Completed",
        results: {
          fragmentation: Number(resultData.fragmentation) || resultData.fragmentation,
          productivity: Number(resultData.productivity) || resultData.productivity,
          incidents: resultData.incidents,
          notes: resultData.notes,
          recordedAt: new Date().toISOString(),
        },
      });
      
      // Trigger completion confirmation dialog box
      displayAlert("Success", "Blast results recorded successfully.", [
        { 
          text: "OK", 
          onPress: () => {
            // Wipes the data entry screen route history cache 
            // and securely drops the user onto the workspace homepage dashboard.
            navigation.reset({
              index: 0,
              routes: [{ name: "Dashboard" }],
            });
          } 
        }
      ]);
    } catch (error) {
      console.error("Metrics submission crash log:", error);
      displayAlert("Error", "Failed to save post-blast performance records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Record Results</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.blastName}>{blastTitle || "Blast Operation"}</Text>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          
          <Text style={styles.label}>Fragmentation Quality (1-10)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 8"
            keyboardType="numeric"
            value={resultData.fragmentation}
            onChangeText={(t) => setResultData({ ...resultData, fragmentation: t })}
          />

          <Text style={styles.label}>Productivity Metric (e.g., Tons/m³)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2.4"
            keyboardType="numeric"
            value={resultData.productivity}
            onChangeText={(t) => setResultData({ ...resultData, productivity: t })}
          />

          <Text style={styles.label}>Safety Incidents</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe any incidents or write 'None'"
            value={resultData.incidents}
            onChangeText={(t) => setResultData({ ...resultData, incidents: t })}
            multiline
          />

          <Text style={styles.label}>General Notes</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Additional observations..."
            value={resultData.notes}
            onChangeText={(t) => setResultData({ ...resultData, notes: t })}
            multiline
          />

          <Pressable 
            style={[styles.saveButton, loading && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Finalize Blast Record</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecordResultScreen;

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
  blastName: { fontSize: 14, color: "#FF9900", fontWeight: "bold", marginBottom: 5 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#1A1F3A", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#2C3E50", marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  saveButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 40,
    shadowColor: "#2ECC71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});