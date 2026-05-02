import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/GlobalStyles';
import { resolveClothingImage } from '../src/utils/ImageResolver';

export const ClothesDetailPage = ({ 
  item, 
  onBack, 
  onDelete, 
  onEdit, 
  isReadOnly, 
  sourcePage // New prop
}: any) => {
  
  // Dynamic Back Button Text
  const getBackText = () => {
    switch(sourcePage) {
      case 'closet': return '← Back to Closet';
      case 'outfit': return '← Back to Outfits';
      case 'home': return '← Home';
      default: return '← Back';
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete Item", "Remove this from your closet?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) }
    ]);
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.topIcons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>{getBackText()}</Text>
        </TouchableOpacity>
        
        {!isReadOnly && (
          <TouchableOpacity onPress={() => onEdit(item)}>
            <Text style={{ color: '#6366f1', fontWeight: 'bold' }}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Image 
        source={resolveClothingImage(item.image)} 
        style={styles.detailImage} 
        resizeMode="contain" 
      />

      <View style={styles.detailContent}>
        <Text style={styles.detailType}>{item.name}</Text>
        
        {/* Visual indicator of source */}
        <View style={{ alignSelf: 'flex-start', backgroundColor: '#e0e7ff', paddingHorizontal: 10, borderRadius: 5, marginBottom: 10 }}>
          {/*<Text style={{ fontSize: 10, color: '#4338ca', textTransform: 'uppercase' }}>
            {isReadOnly ? `Viewing via ${sourcePage}` : "Closet Item"}
          </Text>*/}
        </View>

        <Text style={styles.detailColor}>Color: {item.color}</Text>
        <Text style={styles.detailColor}>Category: {item.category}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.descriptionLabel}>Information</Text>
        <Text style={styles.descriptionText}>
          {isReadOnly 
            ? `You are viewing this item as part of an outfit recommendation. It may not be in your closet, but it matches the style of the outfit.`
            : `This is your personal ${item.type}. You can edit its details or remove it from your collection.`
          }
        </Text>

        {!isReadOnly && (
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: '#fee2e2', marginTop: 30 }]} 
            onPress={confirmDelete}
          >
            <Text style={[styles.buttonText, { color: '#ef4444' }]}>Remove from Closet</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};