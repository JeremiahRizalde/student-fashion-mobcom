import {
    Bell,
    Camera,
    Menu as MenuIcon,
    Search,
    Share2,
} from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
    Alert,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SFAIcon = require("../../assets/images/SFA-icon.png");

import { resolveClothingImage } from "../src/utils/ImageResolver";

import { styles } from "../../styles/GlobalStyles";
export const VirtualCloset = ({
  items,
  onSelectItem,
  onAdd,
  featuredOutfit,
  onNavigateToOutfits,
  onDelete,
}: any) => {
  const shakeAnim = useRef<any>({});
  const reveal = useRef(new Animated.Value(0)).current;

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
        <View style={styles.topIcons}>
          <MenuIcon size={22} color="#0F766E" />
          <View style={styles.row}>
            <Bell
              size={18}
              color="#0F766E"
              style={virtualClosetStyles.topIcon}
            />
            <Share2
              size={18}
              color="#0F766E"
              style={virtualClosetStyles.topIcon}
            />
            <Search
              size={18}
              color="#0F766E"
              style={virtualClosetStyles.topIcon}
            />
          </View>
        </View>

        <ScrollView contentContainerStyle={virtualClosetStyles.content}>
          <Text style={styles.wardrobeLabel}>YOUR STYLE ARCHIVE</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.wardrobeTitle}>Wardrobe</Text>
            <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
              <Text style={styles.addText}>Add Item</Text>
              <Camera size={18} color="white" />
            </TouchableOpacity>
          </View>

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
          ) : (
            <View style={styles.grid}>
              {items.map((item: any) => {
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

          <Text style={styles.trendingSectionTitle}>Trending For You</Text>

          <TouchableOpacity
            style={styles.fashionWeekSection}
            onPress={onNavigateToOutfits}
          >
            <Image
              source={resolveClothingImage(
                featuredOutfit?.image || "../../assets/images/FashionWeek.png",
              )}
              style={styles.fashionWeekImage}
              resizeMode="cover"
            />
            <View style={styles.fashionWeekContent}>
              <View style={virtualClosetStyles.trendingBadge}>
                <Text style={virtualClosetStyles.trendingBadgeText}>
                  Style Focus
                </Text>
              </View>
              <Text style={styles.articleTitle}>
                {featuredOutfit?.title || "Loading Trends..."}
              </Text>
              <Text style={styles.articleDescription}>
                {featuredOutfit?.desc ||
                  "Discover fresh combinations curated from your wardrobe."}
              </Text>
              <Text style={styles.authorText}>Based on your closet</Text>
            </View>
          </TouchableOpacity>
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
