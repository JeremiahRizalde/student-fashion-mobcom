import { Home, Layers, ShoppingBag } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { styles } from "../../styles/GlobalStyles";

export const NavigationBar = ({ activeTab, setActiveTab }: any) => (
  <View style={styles.navBar}>
    <TouchableOpacity
      onPress={() => setActiveTab("home")}
      style={[styles.navItem, activeTab === "home" && navStyles.activeItem]}
    >
      <Home color={activeTab === "home" ? "#0F766E" : "#627D98"} size={22} />
      <Text
        style={[styles.navText, activeTab === "home" && styles.activeNavText]}
      >
        Home
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab("closet")}
      style={[styles.navItem, activeTab === "closet" && navStyles.activeItem]}
    >
      <Layers
        color={activeTab === "closet" ? "#0F766E" : "#627D98"}
        size={22}
      />
      <Text
        style={[styles.navText, activeTab === "closet" && styles.activeNavText]}
      >
        Closet
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setActiveTab("outfit")}
      style={[styles.navItem, activeTab === "outfit" && navStyles.activeItem]}
    >
      <ShoppingBag
        color={activeTab === "outfit" ? "#0F766E" : "#627D98"}
        size={22}
      />
      <Text
        style={[styles.navText, activeTab === "outfit" && styles.activeNavText]}
      >
        Looks
      </Text>
    </TouchableOpacity>
  </View>
);

const navStyles = StyleSheet.create({
  activeItem: {
    backgroundColor: "#DFF5F1",
  },
});
