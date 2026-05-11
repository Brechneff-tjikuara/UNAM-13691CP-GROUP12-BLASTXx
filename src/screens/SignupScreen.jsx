import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import logo from "../utils/assets/images/light icon (1).png";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const SignupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Determine Company Code (Use existing or generate new)
      let finalCode = companyCode.trim().toUpperCase();
      let isNewCompany = false;

      if (!finalCode) {
        finalCode = generateCode();
        isNewCompany = true;
      } else {
        // Check if company exists
        const companySnap = await getDoc(doc(db, "companies", finalCode));
        if (!companySnap.exists()) {
          isNewCompany = true;
        }
      }

      // 3. Save User Profile
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        companyCode: finalCode,
        createdAt: new Date().toISOString(),
      });

      // 4. Create Company if new
      if (isNewCompany) {
        await setDoc(doc(db, "companies", finalCode), {
          code: finalCode,
          name: name + "'s Company", // Default name, can be changed in setup
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
        });
      }

      Alert.alert("Success", `Account created! Your Company Code is: ${finalCode}`, [
        { text: "Continue", onPress: () => navigation.navigate("Setup") }
      ]);

    } catch (error) {
      console.error(error);
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start sending blasts today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Company Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter code to join, or leave blank to create"
              value={companyCode}
              onChangeText={setCompanyCode}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Pressable 
            style={[styles.signupButton, loading && { opacity: 0.7 }]} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1F3A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#95A5A6",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1F3A",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  signupButton: {
    backgroundColor: "#FF9900",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#FF9900",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    fontSize: 15,
    color: "#95A5A6",
  },
  loginLink: {
    fontSize: 15,
    color: "#FF9900",
    fontWeight: "bold",
  },
});
