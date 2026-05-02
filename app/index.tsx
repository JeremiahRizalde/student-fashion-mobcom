import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
    ClothingItem,
    DatabaseService,
    OutfitStyle,
} from "./src/services/Database";

// Camera and Styling Imports
import { CameraView, useCameraPermissions } from "expo-camera";
import { styles } from "../styles/GlobalStyles";

// Page and Component Imports
import { NavigationBar } from "./(components)/NavBar";
import { ClothesDetailPage } from "./(pages)/ClothesDetailPage";
import { EditClothingPage } from "./(pages)/EditClothPage"; // Import new page
import { HomePage } from "./(pages)/HomePage";
import { OutfitPage } from "./(pages)/OutfitPage";
import { StartPage } from "./(pages)/StartPage";
import { VirtualCloset } from "./(pages)/VirtualCloset";

import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const pickImage = async (useCamera: boolean) => {
  // 1. Request Permissions
  const permissionResult = useCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    Alert.alert(
      "Permission Denied",
      `We need access to your ${useCamera ? "camera" : "photos"} to add clothes.`,
    );
    return null;
  }

  // 2. Launch the Picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true, // Let user crop the shirt/shoes
    aspect: [1, 1], // Keep it square for your UI
    quality: 1,
  });

  // If you want camera specifically:
  if (useCamera) {
    const camResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    return camResult.canceled ? null : camResult.assets[0].uri;
  }

  return result.canceled ? null : result.assets[0].uri;
};

// --- CAMERA COMPONENT ---
const CameraApp = ({ onCancel, onSave }: any) => {
  const cameraRef = useRef<any>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  // PERMISSION LOGIC: Request camera access from the OS
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Permission is still loading
    return <View style={styles.containerCenter} />;
  }

  if (!permission.granted) {
    // Permission not granted yet: Show "Ask" UI
    return (
      <View style={styles.containerCenter}>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>
          We need your permission to use the camera!
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={{ marginTop: 20 }}>
          <Text style={{ color: "red" }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setPreviewUri(photo.uri);
      } catch (e) {
        console.log("Capture Error:", e);
      }
    }
  };

  // CONFIRMATION PREVIEW
  if (previewUri) {
    return (
      <View style={styles.cameraFullContainer}>
        <Image source={{ uri: previewUri }} style={styles.fullPreview} />
        <View style={styles.confirmOverlay}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onSave(previewUri)}
          >
            <Text style={styles.confirmText}>Confirm & Add to Closet</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPreviewUri(null)}>
            <Text style={styles.cancelText}>Retake</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ACTIVE CAMERA VIEW
  return (
    <View style={styles.cameraFullContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        ref={cameraRef}
        facing="back"
      />
      <View style={styles.cameraOverlay}>
        <View style={styles.cameraTopBar}>
          <Text style={styles.autoText}>Auto Mode</Text>
        </View>
        <View style={styles.cameraBottomBar}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shutterButton}
            onPress={handleCapture}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
        </View>
      </View>
    </View>
  );
};

// --- MAIN APP LOGIC ---
export default function App() {
  const [currentPage, setCurrentPage] = useState("start");
  const [activeTab, setActiveTab] = useState("home");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [activeItem, setActiveItem] = useState<ClothingItem | null>(null);
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [tempImage, setTempImage] = useState<string | null>(null); // To hold the photo before saving
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [previousTab, setPreviousTab] = useState("home");
  const [isEditing, setIsEditing] = useState(false);
  const [outfits, setOutfits] = useState<OutfitStyle[]>([]);
  const pageTranslate = useRef(new Animated.Value(0)).current;
  const TAB_ORDER = ["home", "closet", "outfit"];

  const navigateWithSlide = (targetTab: string, after?: () => void) => {
    const width = Dimensions.get("window").width;
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const targetIndex = TAB_ORDER.indexOf(targetTab);
    const dir =
      targetIndex === -1 || currentIndex === -1
        ? -1
        : targetIndex > currentIndex
          ? -1
          : 1;

    // subtle slide offset (about 10-12% of screen, max 120px)
    const offset = Math.min(120, Math.max(40, Math.round(width * 0.12)));

    // slide current slightly out
    Animated.timing(pageTranslate, {
      toValue: dir * offset,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(targetTab);
      // position next page offscreen on the opposite side (small offset)
      pageTranslate.setValue(-dir * offset);
      // slide next in
      Animated.timing(pageTranslate, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        if (after) after();
      });
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const oData = await DatabaseService.fetchOutfits();
        setOutfits(oData);
      } catch (error) {
        console.error("Failed to load outfits:", error);
      }
    };
    loadData();
  }, []);

  const featured = outfits.length > 0 ? outfits[0] : null;

  const handleEditItem = (item: ClothingItem) => {
    setActiveItem(item);
    setIsEditing(true);
  };

  const handleUpdateSave = async (data: any) => {
    if (activeItem) {
      try {
        const updatedItem: ClothingItem = {
          ...activeItem,
          ...data, // Overwrites with new edited values
        };
        await DatabaseService.updateItem(updatedItem);
        setWardrobe(await DatabaseService.fetchItems());
        setActiveItem(updatedItem); // Show updated info on detail page
        setIsEditing(false);
      } catch (error) {
        Alert.alert(
          "Save Failed",
          "Unable to update this clothing item in MongoDB.",
        );
        console.error("Update item failed:", error);
      }
    }
  };

  // Initialize Database on Startup
  useEffect(() => {
    async function setup() {
      try {
        await DatabaseService.init();
        const data = await DatabaseService.fetchItems();
        setWardrobe(data);
      } catch (error) {
        Alert.alert(
          "Database Error",
          "Unable to connect to MongoDB. Please check your .env configuration.",
        );
        console.error("Database setup failed:", error);
      }
    }
    setup();
  }, []);

  const handlePhotoCaptured = (uri: string) => {
    setTempImage(uri);
    setIsAddingItem(false); // Close the camera
  };

  const handleFinalSave = async (data: any) => {
    try {
      const newItem: ClothingItem = {
        id: Date.now().toString(),
        ...data, // Contains name, type, category, warmth, color, image
      };
      await DatabaseService.addItem(newItem);
      setWardrobe(await DatabaseService.fetchItems());
      setTempImage(null);
    } catch (error) {
      Alert.alert(
        "Save Failed",
        "Unable to add this clothing item to MongoDB.",
      );
      console.error("Add item failed:", error);
    }
  };

  // CRUD: Remove Item
  const handleDeleteItem = async (id: string) => {
    try {
      await DatabaseService.removeItem(id);
      const updated = await DatabaseService.fetchItems();
      setWardrobe(updated);
      navigateWithSlide("closet");
    } catch (error) {
      Alert.alert(
        "Delete Failed",
        "Unable to delete this clothing item from MongoDB.",
      );
      console.error("Delete item failed:", error);
    }
  };

  const handleSelectItem = (item: ClothingItem, viewOnly: boolean = false) => {
    setPreviousTab(activeTab); // Store where we came from (closet, home, or outfit)
    setActiveItem(item);
    setIsViewOnly(viewOnly);
    navigateWithSlide("detail");
  };

  const handleBack = () => {
    navigateWithSlide(previousTab); // Go back to the specific previous tab
    setActiveItem(null);
    setIsViewOnly(false);
  };

  if (currentPage === "start") {
    return <StartPage onStart={() => setCurrentPage("main")} />;
  }

  if (isAddingItem) {
    return (
      <CameraApp
        onCancel={() => setIsAddingItem(false)}
        onSave={handlePhotoCaptured}
      />
    );
  }

  if (tempImage) {
    return (
      <EditClothingPage
        imageUri={tempImage}
        onSave={handleFinalSave}
        onCancel={() => setTempImage(null)}
      />
    );
  }

  if (isEditing && activeItem) {
    return (
      <EditClothingPage
        imageUri={
          typeof activeItem.image === "string" ? activeItem.image : null
        }
        // Pass existing data as initial values to your Edit page
        initialData={activeItem}
        onSave={handleUpdateSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <Animated.View
        style={{ flex: 1, transform: [{ translateX: pageTranslate }] }}
      >
        {activeTab === "home" && (
          <HomePage wardrobe={wardrobe} onSelectItem={handleSelectItem} />
        )}
        {activeTab === "outfit" && (
          <OutfitPage
            wardrobe={wardrobe}
            onNavigateToDetail={(item: any) => handleSelectItem(item, true)}
          />
        )}

        {activeTab === "closet" && (
          <VirtualCloset
            items={wardrobe}
            featuredOutfit={featured}
            onAdd={() => setIsAddingItem(true)}
            onSelectItem={(item: any) => handleSelectItem(item, false)}
            onNavigateToOutfits={() => navigateWithSlide("outfit")} // Quick jump to discovery with slide
            onDelete={(item: ClothingItem) => handleDeleteItem(item.id)}
          />
        )}

        {activeTab === "detail" && activeItem && (
          <ClothesDetailPage
            item={activeItem}
            onBack={handleBack}
            isReadOnly={isViewOnly}
            sourcePage={previousTab} // Pass the source for UI awareness
            onDelete={() => handleDeleteItem(activeItem.id)}
            onEdit={() => handleEditItem(activeItem)}
          />
        )}
      </Animated.View>
      <NavigationBar activeTab={activeTab} setActiveTab={navigateWithSlide} />
    </SafeAreaView>
  );
}
