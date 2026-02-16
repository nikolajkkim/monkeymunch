import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types';
import { ChevronDown, Clock, MapPin, Share } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const EXACT_CARD_WIDTH = (width * 0.8) - 20;

export default function DealDetailsScreen({ route, navigation }: RootStackScreenProps<'DealDetails'>) {
  const { deal } = route.params;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy > 20 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx); 
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) {
          navigation.goBack();
        }
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.dragIndicatorContainer}>
        <ChevronDown color="#888" size={24} strokeWidth={2.5} />
      </View>
      
      <View style={styles.contentWrapper}>
        <Image 
          source={{ uri: deal.image }} 
          style={styles.image} 
        />
        
        <Text style={styles.restaurant}>{deal.restaurant}</Text>
        <Text style={styles.title}>{deal.title}</Text>
        
        <Text style={styles.sectionTitle}>ABOUT THIS DEAL</Text>
        <Text style={styles.description}>{deal.description}</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Clock color="#111" size={20} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.infoLabel}>VALIDITY</Text>
            <Text style={styles.infoValue}>{deal.validity}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <MapPin color="#111" size={20} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.infoLabel}>DISTANCE</Text>
            <Text style={styles.infoValue}>{deal.distance.toLowerCase()}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={() => console.log('Share clicked')}>
          <Share color="#FFF" size={18} strokeWidth={2.5} style={{ marginRight: 8 }} />
          <Text style={styles.shareButtonText}>Share Deal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  dragIndicatorContainer: { alignItems: 'center', paddingTop: 0, paddingBottom: 10 },
  contentWrapper: { width: EXACT_CARD_WIDTH, alignSelf: 'center' },
  image: { width: '100%', height: 300, resizeMode: 'cover', marginBottom: 24 },
  restaurant: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 32 },
  sectionTitle: { fontSize: 11, color: '#888', fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  description: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 32 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 32, alignItems: 'flex-start' },
  infoLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#111', fontWeight: '500' },
  shareButton: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  shareButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' }
});