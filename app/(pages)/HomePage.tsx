import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/GlobalStyles";
const SFAIcon = require("../../assets/images/SFA-icon.png");

import { ClothingItem } from "../src/services/Database";

import { resolveClothingImage } from "../src/utils/ImageResolver";

interface SelectedOutfit {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  shoes: ClothingItem | null;
}

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const weatherCodeDescriptions = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

interface Weather {
  temperature: number;
  weathercode: number;
  [key: string]: any;
}

interface HomePageProps {
  wardrobe: ClothingItem[];
  onSelectItem?: (item: ClothingItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  wardrobe = [],
  onSelectItem,
}) => {
  const screenEnter = useRef(new Animated.Value(0)).current;
  const outfitAnim = useRef(new Animated.Value(1)).current;
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<SelectedOutfit>({
    top: null,
    bottom: null,
    shoes: null,
  });
  const [lockedSlots, setLockedSlots] = useState({
    top: false,
    bottom: false,
    shoes: false,
  });

  useEffect(() => {
    Animated.timing(screenEnter, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true,
    }).start();

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=16.4023&longitude=120.5960&current_weather=true",
        );
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const setOutfitWithAnimation = React.useCallback(
    (outfit: SelectedOutfit) => {
      Animated.sequence([
        Animated.timing(outfitAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(outfitAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      setSelectedOutfit(outfit);
    },
    [outfitAnim],
  );

  // Select outfit based on weather when weather changes or wardrobe updates
  useEffect(() => {
    if (weather && wardrobe.length > 0) {
      const outfit = selectOutfitBasedOnWeather(weather.temperature, wardrobe);
      setOutfitWithAnimation(outfit);
    }
  }, [weather, wardrobe, setOutfitWithAnimation]);

  const selectOutfitBasedOnWeather = (
    temperature: number,
    items: ClothingItem[],
  ): SelectedOutfit => {
    // Categorize items
    const tops = items.filter((item) => item.category === "top");
    const bottoms = items.filter((item) => item.category === "bottom");
    const shoes = items.filter((item) => item.category === "shoes");

    let selectedTop: ClothingItem | null = null;
    let selectedBottom: ClothingItem | null = null;
    let selectedShoes: ClothingItem | null = null;

    // Temperature-based selection logic
    if (temperature <= 18) {
      // Cold weather - prefer warm clothes
      selectedTop = tops.find((t) => t.warmth === "warm") || tops[0] || null;
      selectedBottom =
        bottoms.find(
          (b) =>
            b.type.toLowerCase().includes("pants") ||
            b.type.toLowerCase().includes("trousers"),
        ) ||
        bottoms[0] ||
        null;
    } else if (temperature <= 25) {
      // Moderate weather
      selectedTop = tops.find((t) => t.warmth === "medium") || tops[0] || null;
      selectedBottom = bottoms[0] || null;
    } else {
      // Hot weather - prefer light clothes
      selectedTop = tops.find((t) => t.warmth === "light") || tops[0] || null;
      selectedBottom =
        bottoms.find((b) => b.type.toLowerCase().includes("shorts")) ||
        bottoms[0] ||
        null;
    }

    // Select shoes (first available)
    selectedShoes = shoes[0] || null;

    return {
      top: selectedTop,
      bottom: selectedBottom,
      shoes: selectedShoes,
    };
  };

  const shuffleOutfit = () => {
    if (weather && wardrobe.length > 0) {
      const tops = wardrobe.filter((item) => item.category === "top");
      const bottoms = wardrobe.filter((item) => item.category === "bottom");
      const shoes = wardrobe.filter((item) => item.category === "shoes");

      // Get different clothes from current selection
      const getRandomDifferent = (
        items: ClothingItem[],
        current: ClothingItem | null,
      ) => {
        if (items.length === 0) return null;
        if (items.length === 1) return items[0];

        const available = current
          ? items.filter((i) => i.id !== current.id)
          : items;
        return (
          available[Math.floor(Math.random() * available.length)] || items[0]
        );
      };

      setOutfitWithAnimation({
        top:
          lockedSlots.top && selectedOutfit.top
            ? selectedOutfit.top
            : getRandomDifferent(tops, selectedOutfit.top),
        bottom:
          lockedSlots.bottom && selectedOutfit.bottom
            ? selectedOutfit.bottom
            : getRandomDifferent(bottoms, selectedOutfit.bottom),
        shoes:
          lockedSlots.shoes && selectedOutfit.shoes
            ? selectedOutfit.shoes
            : getRandomDifferent(shoes, selectedOutfit.shoes),
      });
    }
  };

  const toggleLock = (slot: keyof SelectedOutfit) => {
    setLockedSlots((prev) => ({
      ...prev,
      [slot]: !prev[slot],
    }));
  };

  const getOutfitSuggestion = (weatherCode: number, temperature: number) => {
    if (temperature <= 18) {
      return "Wear something warm — a jacket or sweater is recommended.";
    }

    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
      return "Bring a jacket or umbrella. Water-resistant clothing is best.";
    }

    if ([45, 48].includes(weatherCode)) {
      return "Wear warm layers and stay visible in foggy conditions.";
    }

    if ([95, 96, 99].includes(weatherCode)) {
      return "Stay dry and warm. Avoid light clothing and bring protection.";
    }

    return "Comfortable casual wear should be fine.";
  };

  const description = weather
    ? weatherCodeDescriptions[
        weather.weathercode as keyof typeof weatherCodeDescriptions
      ] || "Unknown"
    : "Unknown";

  const outfitAdvice = weather
    ? getOutfitSuggestion(weather.weathercode, weather.temperature)
    : "Unable to generate outfit advice";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={homeStyles.container}
    >
      <Animated.View
        style={{
          opacity: screenEnter,
          transform: [
            {
              translateY: screenEnter.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        }}
      >
        <View style={styles.headerIconRow}>
          <View>
            <Text style={styles.logoTextSmall}>Student</Text>
            <Text style={[styles.logoTextSmall, homeStyles.brandAccent]}>
              Fashion
            </Text>
          </View>
          <Image
            source={SFAIcon}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.dateText}>{formattedDate}</Text>

          <View style={styles.weatherCard}>
            {loading ? (
              <Text style={homeStyles.loadingText}>Loading weather...</Text>
            ) : weather ? (
              <>
                <View style={homeStyles.weatherLeft}>
                  <Text style={styles.tempText}>
                    {weather.temperature} deg C
                  </Text>
                  <View style={homeStyles.conditionPill}>
                    <Text style={homeStyles.conditionText}>{description}</Text>
                  </View>
                </View>
                <Text style={styles.weatherDesc}>{outfitAdvice}</Text>
              </>
            ) : (
              <Text style={homeStyles.loadingText}>Weather unavailable</Text>
            )}
          </View>
        </View>

        <View style={styles.ootdSection}>
          <Text style={styles.sectionTitle}>Outfit of the Day</Text>
          <View style={styles.ootdContainer}>
            {selectedOutfit.top ||
            selectedOutfit.bottom ||
            selectedOutfit.shoes ? (
              <>
                <Animated.View
                  style={[
                    styles.outfitDisplay,
                    {
                      opacity: outfitAnim,
                      transform: [
                        {
                          scale: outfitAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.95, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {selectedOutfit.top && (
                    <TouchableOpacity
                      style={[
                        styles.outfitItem,
                        homeStyles.outfitItemCard,
                        lockedSlots.top && homeStyles.lockedItemCard,
                      ]}
                      onPress={() => onSelectItem?.(selectedOutfit.top!)}
                      onLongPress={() => toggleLock("top")}
                    >
                      {lockedSlots.top && (
                        <View style={homeStyles.lockBadge}>
                          <Text style={homeStyles.lockBadgeText}>Locked</Text>
                        </View>
                      )}
                      <Image
                        source={resolveClothingImage(selectedOutfit.top.image)}
                        style={styles.outfitItemImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.outfitItemLabel}>Top</Text>
                    </TouchableOpacity>
                  )}

                  {selectedOutfit.bottom && (
                    <TouchableOpacity
                      style={[
                        styles.outfitItem,
                        homeStyles.outfitItemCard,
                        lockedSlots.bottom && homeStyles.lockedItemCard,
                      ]}
                      onPress={() => onSelectItem?.(selectedOutfit.bottom!)}
                      onLongPress={() => toggleLock("bottom")}
                    >
                      {lockedSlots.bottom && (
                        <View style={homeStyles.lockBadge}>
                          <Text style={homeStyles.lockBadgeText}>Locked</Text>
                        </View>
                      )}
                      <Image
                        source={resolveClothingImage(
                          selectedOutfit.bottom.image,
                        )}
                        style={styles.outfitItemImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.outfitItemLabel}>Bottom</Text>
                    </TouchableOpacity>
                  )}

                  {selectedOutfit.shoes && (
                    <TouchableOpacity
                      style={[
                        styles.outfitItem,
                        homeStyles.outfitItemCard,
                        lockedSlots.shoes && homeStyles.lockedItemCard,
                      ]}
                      onPress={() => onSelectItem?.(selectedOutfit.shoes!)}
                      onLongPress={() => toggleLock("shoes")}
                    >
                      {lockedSlots.shoes && (
                        <View style={homeStyles.lockBadge}>
                          <Text style={homeStyles.lockBadgeText}>Locked</Text>
                        </View>
                      )}
                      <Image
                        source={resolveClothingImage(
                          selectedOutfit.shoes.image,
                        )}
                        style={styles.outfitItemImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.outfitItemLabel}>Shoes</Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>

                <TouchableOpacity
                  style={styles.shuffleButton}
                  onPress={shuffleOutfit}
                >
                  <Text style={styles.shuffleText}>Shuffle Look</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.placeholderOutfit}>
                <Text style={styles.noOutfitText}>
                  Add clothes to your wardrobe to unlock weather-based style
                  picks.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const homeStyles = StyleSheet.create({
  container: {
    paddingBottom: 26,
  },
  brandAccent: {
    color: "#0F766E",
    marginTop: -4,
  },
  loadingText: {
    color: "#ECFEFF",
    fontWeight: "700",
  },
  weatherLeft: {
    marginRight: 12,
  },
  conditionPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },
  conditionText: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  outfitItemCard: {
    borderWidth: 1,
    borderColor: "#D9E2EC",
  },
  lockedItemCard: {
    borderColor: "#0F766E",
    shadowColor: "#0F766E",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15, 118, 110, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 2,
  },
  lockBadgeText: {
    color: "#F8FAFC",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
