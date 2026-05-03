import { Camera } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SFAIcon = require("../../assets/images/SFA-icon.png");

import { resolveClothingImage } from "../src/utils/ImageResolver";

import { styles } from "../../styles/GlobalStyles";
export const VirtualCloset = ({
  items = [],
  onSelectItem,
  onAdd,
  featuredOutfit,
  onNavigateToOutfits,
  onDelete,
}: any) => {
  const shakeAnim = useRef<any>({});
  const reveal = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWarmth, setSelectedWarmth] = useState("All");

  const colorOptions = useMemo(() => {
    const colorMap = new Map<string, string>();
    items.forEach((item: any) => {
      const raw = typeof item.color === "string" ? item.color.trim() : "";
      if (!raw) return;
      const key = raw.toLowerCase();
      if (!colorMap.has(key)) colorMap.set(key, raw);
    });

    return ["All", ...Array.from(colorMap.values()).sort()];
  }, [items]);

  useEffect(() => {
    if (selectedColor !== "All" && !colorOptions.includes(selectedColor)) {
      setSelectedColor("All");
    }
  }, [colorOptions, selectedColor]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter((item: any) => {
    const nameMatch = normalizedQuery
      ? String(item.name || "")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const colorMatch =
      selectedColor === "All"
        ? true
        : String(item.color || "").toLowerCase() ===
          selectedColor.toLowerCase();
    const categoryMatch =
      selectedCategory === "All"
        ? true
        : String(item.category || "") === selectedCategory;
    const warmthMatch =
      selectedWarmth === "All"
        ? true
        : String(item.warmth || "") === selectedWarmth;

    return nameMatch && colorMatch && categoryMatch && warmthMatch;
  });

  const hasActiveFilters =
    normalizedQuery.length > 0 ||
    selectedColor !== "All" ||
    selectedCategory !== "All" ||
    selectedWarmth !== "All";

  useEffect(() => {
    Animated.timing(reveal, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true,
    }).start();
  }, [reveal]);

  const handleLongPress = (item: any) => {
    const id = String(item.id);
    if (!shakeAnim.current[id]) shakeAnim.current[id] = new Animated.Value(0);
    const anim = shakeAnim.current[id];

    const sequence = Animated.sequence([
      Animated.timing(anim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: -6,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 6,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: -3,
        duration: 30,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 3,
        duration: 30,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 30,
        useNativeDriver: true,
      }),
    ]);

    sequence.start(() => {
      Alert.alert(
        "Delete Item",
        "Do you want to delete this item from your closet?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete?.(item),
          },
        ],
        { cancelable: true },
      );
    });
  };

  return (
    <View style={styles.screen}>
      <Animated.View
        style={{
          flex: 1,
          opacity: reveal,
          transform: [
            {
              translateY: reveal.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        }}
      >
        <ScrollView contentContainerStyle={virtualClosetStyles.content}>
          <Text style={styles.wardrobeLabel}>YOUR STYLE ARCHIVE</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.wardrobeTitle}>Wardrobe</Text>
            <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
              <Text style={styles.addText}>Add Item</Text>
              <Camera size={18} color="white" />
            </TouchableOpacity>
          </View>

          <View style={virtualClosetStyles.searchCard}>
            <TextInput
              style={virtualClosetStyles.searchInput}
              placeholder="Search by name"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity
                style={virtualClosetStyles.clearButton}
                onPress={() => setSearchQuery("")}
              >
                <Text style={virtualClosetStyles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={virtualClosetStyles.filterSection}>
            <Text style={virtualClosetStyles.filterLabel}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={virtualClosetStyles.filterRow}>
                {colorOptions.map((option) => (
                  <TouchableOpacity
                    key={`color-${option}`}
                    style={[
                      virtualClosetStyles.filterChip,
                      selectedColor === option &&
                        virtualClosetStyles.filterChipActive,
                    ]}
                    onPress={() => setSelectedColor(option)}
                  >
                    <Text
                      style={[
                        virtualClosetStyles.filterChipText,
                        selectedColor === option &&
                          virtualClosetStyles.filterChipTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={virtualClosetStyles.filterSection}>
            <Text style={virtualClosetStyles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={virtualClosetStyles.filterRow}>
                {["All", "top", "bottom", "shoes"].map((option) => (
                  <TouchableOpacity
                    key={`category-${option}`}
                    style={[
                      virtualClosetStyles.filterChip,
                      selectedCategory === option &&
                        virtualClosetStyles.filterChipActive,
                    ]}
                    onPress={() => setSelectedCategory(option)}
                  >
                    <Text
                      style={[
                        virtualClosetStyles.filterChipText,
                        selectedCategory === option &&
                          virtualClosetStyles.filterChipTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={virtualClosetStyles.filterSection}>
            <Text style={virtualClosetStyles.filterLabel}>Warmth</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={virtualClosetStyles.filterRow}>
                {["All", "light", "medium", "warm", "cold", "rainy"].map(
                  (option) => (
                    <TouchableOpacity
                      key={`warmth-${option}`}
                      style={[
                        virtualClosetStyles.filterChip,
                        selectedWarmth === option &&
                          virtualClosetStyles.filterChipActive,
                      ]}
                      onPress={() => setSelectedWarmth(option)}
                    >
                      <Text
                        style={[
                          virtualClosetStyles.filterChipText,
                          selectedWarmth === option &&
                            virtualClosetStyles.filterChipTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </ScrollView>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity
              style={virtualClosetStyles.clearFilters}
              onPress={() => {
                setSearchQuery("");
                setSelectedColor("All");
                setSelectedCategory("All");
                setSelectedWarmth("All");
              }}
            >
              <Text style={virtualClosetStyles.clearFiltersText}>
                Clear filters
              </Text>
            </TouchableOpacity>
          )}

          {items.length === 0 ? (
            <View style={virtualClosetStyles.emptyCard}>
              <Text style={virtualClosetStyles.emptyTitle}>
                Your closet is empty
              </Text>
              <Text style={virtualClosetStyles.emptyText}>
                Start by adding your first clothing photo. We will build
                weather-based recommendations from it.
              </Text>
              <TouchableOpacity
                style={virtualClosetStyles.emptyButton}
                onPress={onAdd}
              >
                <Text style={virtualClosetStyles.emptyButtonText}>
                  Add First Item
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={virtualClosetStyles.emptyCard}>
              <Text style={virtualClosetStyles.emptyTitle}>
                No matching clothes
              </Text>
              <Text style={virtualClosetStyles.emptyText}>
                Try a different search or clear your filters.
              </Text>
              <TouchableOpacity
                style={virtualClosetStyles.emptyButton}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedColor("All");
                  setSelectedCategory("All");
                  setSelectedWarmth("All");
                }}
              >
                <Text style={virtualClosetStyles.emptyButtonText}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredItems.map((item: any) => {
                const id = String(item.id);
                if (!shakeAnim.current[id])
                  shakeAnim.current[id] = new Animated.Value(0);
                const translateX = shakeAnim.current[id];

                return (
                  <View key={item.id} style={styles.gridItem}>
                    <Animated.View
                      style={{ transform: [{ translateX: translateX || 0 }] }}
                    >
                      <TouchableOpacity
                        onPress={() => onSelectItem(item)}
                        onLongPress={() => handleLongPress(item)}
                      >
                        <Image
                          source={resolveClothingImage(item.image)}
                          style={styles.wardrobeImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.itemBar} />

                    <Text style={styles.itemText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemSubText}>{item.color}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const virtualClosetStyles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  searchCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9E2EC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    color: "#102A43",
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 8,
  },
  clearButtonText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
  },
  filterSection: {
    marginTop: 14,
  },
  filterLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    paddingRight: 8,
  },
  filterChip: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#0F766E",
  },
  filterChipText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  filterChipTextActive: {
    color: "#F8FAFC",
  },
  clearFilters: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#0F766E",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearFiltersText: {
    color: "#0F766E",
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    fontSize: 12,
  },
  topIcon: {
    marginHorizontal: 8,
  },
  trendingBadge: {
    backgroundColor: "#DFF5F1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  trendingBadgeText: {
    color: "#0F766E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  emptyCard: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9E2EC",
    backgroundColor: "#FFFFFF",
    padding: 18,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#102A43",
    fontWeight: "900",
    marginBottom: 8,
  },
  emptyText: {
    color: "#627D98",
    lineHeight: 21,
    fontSize: 14,
    marginBottom: 14,
  },
  emptyButton: {
    alignSelf: "flex-start",
    backgroundColor: "#0F766E",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: "#F8FAFC",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
