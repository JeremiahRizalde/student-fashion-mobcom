import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../styles/GlobalStyles';
import { DatabaseService, OutfitStyle } from '../src/services/Database';
import { resolveClothingImage } from '../src/utils/ImageResolver';

export const OutfitPage = ({ wardrobe, onNavigateToDetail }: any) => {
  const [dbOutfits, setDbOutfits] = useState<OutfitStyle[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<any>(null);

  useEffect(() => {
    const loadOutfits = async () => {
      const data = await DatabaseService.fetchOutfits();
      setDbOutfits(data);
    };
    loadOutfits();
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.detailContent}>
          <Text style={styles.trendingSectionTitle}>Outfit Styles of the Day</Text>
          
          {dbOutfits.map((outfit) => {
            const neededIds = outfit.clothesNeeded.split(',');
            
            return (
              <View key={outfit.id} style={styles.fashionWeekSection}>
                {/* USE RESOLVER FOR MAIN OUTFIT IMAGE */}
                <TouchableOpacity onPress={() => setFullscreenImage(resolveClothingImage(outfit.image))}>
                  <Image 
                    source={resolveClothingImage(outfit.image)} 
                    style={styles.fashionWeekImage} 
                  />
                </TouchableOpacity>
                
                <View style={styles.fashionWeekContent}>
                  <Text style={styles.articleTitle}>{outfit.title}</Text>
                  <Text style={styles.articleDescription}>{outfit.desc}</Text>
                  <Text style={styles.authorText}>{outfit.meta}</Text>
                </View>

                <View style={styles.divider} />
                <Text style={styles.descriptionLabel}>Get the Look from your Closet:</Text>
                
                <View style={styles.carouselContainer}>
                  {neededIds.map((cid) => {
                    const item = wardrobe.find((w: any) => w.id === cid);
                    if (!item) return null;
                    return (
                      <TouchableOpacity 
                        key={cid} 
                        style={styles.clothingListItem}
                        onPress={() => onNavigateToDetail(item)}
                      >
                        {/* USE RESOLVER FOR MINI THUMBNAILS */}
                        <Image source={resolveClothingImage(item.image)} style={styles.miniThumb} />
                        <View>
                            <Text style={styles.miniText}>{item.name}</Text>
                            {/*<Text style={{fontSize: 10, color: '#666'}}>{item.color}</Text>*/}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={!!fullscreenImage} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={() => setFullscreenImage(null)} />
          <View style={styles.fullImageContainer}>
            {/* MODAL IMAGE ALSO NEEDS RESOLVED SOURCE */}
            <Image source={fullscreenImage} style={styles.fullViewImage} resizeMode="contain" />
            <TouchableOpacity style={styles.closeButton} onPress={() => setFullscreenImage(null)}>
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};