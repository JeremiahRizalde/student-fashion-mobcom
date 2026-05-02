import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/GlobalStyles";
import { resolveClothingImage } from "../src/utils/ImageResolver";

export const EditClothingPage = ({
  imageUri,
  initialData,
  onSave,
  onCancel,
}: any) => {
  // 1. Setup States for all data types
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "");
  const [category, setCategory] = useState(initialData?.category || "top");
  const [warmth, setWarmth] = useState(initialData?.warmth || "medium");
  const [color, setColor] = useState(initialData?.color || "");
  const [displayImage, setDisplayImage] = useState(
    imageUri || initialData?.image,
  );

  const categories = ["top", "bottom", "shoes"];
  const warmthLevels = ["light", "medium", "warm", "cold", "rainy"];

  // 2. Function to swap the photo (Camera or Gallery)
  const handleChangePhoto = async () => {
    Alert.alert("Change Photo", "Pick a source:", [
      {
        text: "Camera",
        onPress: async () => {
          const res = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
          });
          if (!res.canceled) setDisplayImage(res.assets[0].uri);
        },
      },
      //OPTIONAL!!!
      /*{ text: "Gallery", onPress: async () => {
          const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1] });
          if (!res.canceled) setDisplayImage(res.assets[0].uri);
      }},*/
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // 3. Logic to process the save
  const handleFinalSave = async () => {
    const itemData = {
      id: initialData?.id || Date.now().toString(),
      name,
      type,
      category,
      warmth,
      color,
      image: displayImage,
    };

    // Only run FileSystem logic on native for camera/gallery temporary files.
    if (
      Platform.OS !== "web" &&
      typeof displayImage === "string" &&
      displayImage.startsWith("file://")
    ) {
      try {
        const fileName = displayImage.split("/").pop();
        const newPath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.copyAsync({
          from: displayImage,
          to: newPath,
        });

        itemData.image = newPath;
        console.log("Successfully saved to permanent storage:", newPath);
      } catch (e) {
        console.warn("FileSystem copy failed, using temporary URI instead.", e);
        itemData.image = displayImage;
      }
    }

    try {
      await onSave(itemData);
    } catch (error) {
      Alert.alert("Save Failed", "Unable to save clothing changes to MongoDB.");
      console.error("EditClothingPage save failed:", error);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <Text
        style={[
          styles.trendingSectionTitle,
          { marginTop: 40, textAlign: "center" },
        ]}
      >
        {initialData ? "Edit Clothing" : "Add New Clothing"}
      </Text>

      <TouchableOpacity
        onPress={handleChangePhoto}
        style={editStyles.imageContainer}
      >
        <Image
          source={resolveClothingImage(displayImage)}
          style={editStyles.previewImage}
        />
        <View style={editStyles.changeBadge}>
          <Text style={editStyles.changeText}>Tap to Change Photo</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.detailContent}>
        <Text style={styles.descriptionLabel}>
          Name (e.g., "Favorite Hoodie")
        </Text>
        <TextInput
          style={editStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="Name"
        />

        <Text style={styles.descriptionLabel}>Type (e.g., "Oversized")</Text>
        <TextInput
          style={editStyles.input}
          value={type}
          onChangeText={setType}
          placeholder="Type"
        />

        <Text style={styles.descriptionLabel}>Color</Text>
        <TextInput
          style={editStyles.input}
          value={color}
          onChangeText={setColor}
          placeholder="Color"
        />

        <Text style={styles.descriptionLabel}>Category</Text>
        <View style={editStyles.row}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                editStyles.chip,
                category === cat && editStyles.activeChip,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  editStyles.chipText,
                  category === cat && editStyles.activeChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.descriptionLabel}>Warmth</Text>
        <View style={editStyles.row}>
          {warmthLevels.map((w) => (
            <TouchableOpacity
              key={w}
              style={[editStyles.chip, warmth === w && editStyles.activeChip]}
              onPress={() => setWarmth(w)}
            >
              <Text
                style={[
                  editStyles.chipText,
                  warmth === w && editStyles.activeChipText,
                ]}
              >
                {w}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleFinalSave}
        >
          <Text style={styles.buttonText}>Save to Closet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          style={{ marginTop: 15, paddingBottom: 40, alignItems: "center" }}
        >
          <Text style={{ color: "red" }}>Discard Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const editStyles = StyleSheet.create({
  imageContainer: { width: "100%", height: 300, marginBottom: 20 },
  previewImage: { width: "100%", height: "100%", borderRadius: 20 },
  changeBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 10,
  },
  changeText: { color: "white", fontSize: 12 },
  input: {
    backgroundColor: "#f3f4f6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 15 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
    marginBottom: 8,
  },
  activeChip: { backgroundColor: "#6366f1" },
  chipText: { color: "#4b5563" },
  activeChipText: { color: "#fff" },
});
