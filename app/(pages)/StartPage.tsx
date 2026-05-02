import React, { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles/GlobalStyles";

// The icon reference
const SFAIcon = require("../../assets/images/SFA-icon.png");

export const StartPage = ({ onStart }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 7,
      }),
    ]).start();
  }, [opacity, scale, translateY]);

  const handleStart = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -14,
          duration: 260,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onStart && onStart();
    });
  };

  return (
    <SafeAreaView style={[styles.containerCenter, startStyles.screen]}>
      <View style={startStyles.blobTop} />
      <View style={startStyles.blobBottom} />
      <Animated.View
        style={{
          width: "100%",
          alignItems: "center",
          opacity,
          transform: [{ translateY }, { scale }],
        }}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Student</Text>
          <Text style={[styles.logoText, { color: "#0F766E" }]}>Fashion</Text>
        </View>

        <Image source={SFAIcon} style={styles.mainIcon} resizeMode="contain" />

        <Text style={styles.welcomeText}>WELCOME</Text>
        <Text style={startStyles.subtitle}>
          Personalized outfit picks from your own closet
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const startStyles = StyleSheet.create({
  screen: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#486581",
    textAlign: "center",
    marginBottom: 28,
    maxWidth: 260,
    lineHeight: 21,
    fontWeight: "600",
  },
  blobTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#DFF5F1",
    top: -60,
    left: -80,
  },
  blobBottom: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "#FFF3DD",
    bottom: -110,
    right: -120,
  },
});
