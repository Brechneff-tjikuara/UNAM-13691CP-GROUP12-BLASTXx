import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../utils/storage";

const SetupScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState({
    companyName: "",
    location: "",
    mineType: "",
    explosiveProvider: "",
    detonatorType: "",
    apiKey: "",
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    try {
      const uData = await storage.getUserData();
      if (uData && uData.companyCode) {
        await storage.updateCompanyInfo(uData.companyCode, {
          name: setupData.companyName,
          location: setupData.location,
          mineType: setupData.mineType,
          explosiveProvider: setupData.explosiveProvider,
          detonatorType: setupData.detonatorType,
          apiKey: setupData.apiKey,
        });
        navigation.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
      } else {
        Alert.alert("Error", "User data not found. Please log in again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setSetupData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Welcome to BlastX!</Text>
            <Text style={styles.stepDescription}>
              Let's get your mine's blast management app set up.
              We'll configure your site profile and operational preferences.
            </Text>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeIcon}>⚒️</Text>
              <Text style={styles.welcomeText}>
                Plan, track, and record blast activities for maximum safety and productivity.
              </Text>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Mine Information</Text>
            <Text style={styles.stepDescription}>
              Tell us about your operation to personalize your experience.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mine/Company Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your company name"
                value={setupData.companyName}
                onChangeText={(value) =>
                  handleInputChange("companyName", value)
                }
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location (City/Region)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Kalgoorlie, WA"
                value={setupData.location}
                onChangeText={(value) => handleInputChange("location", value)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mine Type</Text>
              <View style={styles.providerOptions}>
                <Pressable
                  style={[
                    styles.providerOption,
                    setupData.mineType === "open_pit" &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange("mineType", "open_pit")}
                >
                  <Text style={styles.providerText}>Open Pit</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.providerOption,
                    setupData.mineType === "underground" &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    handleInputChange("mineType", "underground")
                  }
                >
                  <Text style={styles.providerText}>Underground</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Explosives & Detonators</Text>
            <Text style={styles.stepDescription}>
              Configure your primary supply chain for blast records.
            </Text>
            <View style={styles.channelContainer}>
              <Text style={styles.channelTitle}>🧨 Explosive Provider</Text>
              <View style={styles.providerOptions}>
                <Pressable
                  style={[
                    styles.providerOption,
                    setupData.explosiveProvider === "orica" &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange("explosiveProvider", "orica")}
                >
                  <Text style={styles.providerText}>Orica</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.providerOption,
                    setupData.explosiveProvider === "dyno" &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    handleInputChange("explosiveProvider", "dyno")
                  }
                >
                  <Text style={styles.providerText}>Dyno Nobel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.providerOption,
                    setupData.explosiveProvider === "other" && styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange("explosiveProvider", "other")}
                >
                  <Text style={styles.providerText}>Other</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.channelContainer}>
              <Text style={styles.channelTitle}>⚡ Detonator Type</Text>
              <View style={styles.providerOptions}>
                <Pressable
                  style={[
                    styles.providerOption,
                    setupData.detonatorType === "electronic" && styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange("detonatorType", "electronic")}
                >
                  <Text style={styles.providerText}>Electronic</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.providerOption,
                    setupData.detonatorType === "nonel" && styles.selectedOption,
                  ]}
                  onPress={() => handleInputChange("detonatorType", "nonel")}
                >
                  <Text style={styles.providerText}>Nonel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Operational Configuration</Text>
            <Text style={styles.stepDescription}>
              Review your setup. You can adjust these settings at any time from the profile menu.
            </Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🛡️</Text>
              <Text style={styles.infoText}>
                BlastX prioritizes site safety. All blast operations require multiple safety sign-offs before the timer can be activated.
              </Text>
            </View>
            <View style={styles.setupComplete}>
              <Text style={styles.completeIcon}>⚒️</Text>
              <Text style={styles.completeTitle}>Ready for Operations!</Text>
              <Text style={styles.completeText}>
                You're all set to start planning and recording your mine's blast activities.
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Setup</Text>
        <Pressable 
          style={styles.skipButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                currentStep >= step && styles.activeProgressDot,
              ]}
            >
              <Text
                style={[
                  styles.progressNumber,
                  currentStep >= step && styles.activeProgressNumber,
                ]}
              >
                {step}
              </Text>
            </View>
            {step < 4 && (
              <View
                style={[
                  styles.progressLine,
                  currentStep > step && styles.activeProgressLine,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.nextButton, currentStep === 4 && styles.finishButton]}
          onPress={currentStep === 4 ? handleFinish : handleNext}
        >
          <Text
            style={[
              styles.nextButtonText,
              currentStep === 4 && styles.finishButtonText,
            ]}
          >
            {currentStep === 4 ? "Finish Setup" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SetupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#2C3E50",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  skipButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  skipButtonText: {
    color: "#FFF",
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  activeProgressDot: {
    backgroundColor: "#4ECDC4",
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#95A5A6",
  },
  activeProgressNumber: {
    color: "#FFF",
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
  },
  activeProgressLine: {
    backgroundColor: "#4ECDC4",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: "#95A5A6",
    lineHeight: 22,
    marginBottom: 30,
  },
  welcomeCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: "#2C3E50",
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  channelContainer: {
    marginBottom: 25,
  },
  channelTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 15,
  },
  providerOptions: {
    flexDirection: "row",
    gap: 10,
  },
  providerOption: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  selectedOption: {
    borderColor: "#4ECDC4",
    backgroundColor: "#F0FDFA",
  },
  providerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  infoCard: {
    backgroundColor: "#E8F4FD",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#3498DB",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
    flex: 1,
  },
  setupComplete: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  completeIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10,
  },
  completeText: {
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 15,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  nextButton: {
    flex: 2,
    backgroundColor: "#4ECDC4",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  finishButton: {
    backgroundColor: "#2ECC71",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  finishButtonText: {
    color: "#FFF",
  },
});
