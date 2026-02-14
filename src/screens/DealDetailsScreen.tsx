import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types';

export default function DealDetailsScreen({ route, navigation }: RootStackScreenProps<'DealDetails'>) {
  const { deal } = route.params;

  // Listen for a downward swipe to close the screen
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 20; // Only claim vertical swipes
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) {
          // Swiped DOWN -> Go back to Home
          navigation.goBack();
        }
      },
    })
  ).current;

  return (
    // Attach the panHandlers to the root wrapper of the screen
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']} {...panResponder.panHandlers}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>v SWIPE DOWN TO CLOSE DETAILS</Text>
      </TouchableOpacity>
      
      <Image source={{ uri: deal.image }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.restaurant}>{deal.restaurant}</Text>
        <Text style={styles.title}>{deal.title}</Text>
        <Text style={styles.distance}>{deal.distance}</Text>
        <View style={styles.tag}><Text style={styles.tagText}>{deal.type}</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  closeButton: { padding: 20, alignItems: 'center', position: 'absolute', top: 40, width: '100%', zIndex: 10 },
  closeText: { fontSize: 12, fontWeight: 'bold', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  image: { width: '100%', height: 400, resizeMode: 'cover' },
  content: { padding: 24 },
  restaurant: { fontSize: 16, color: '#666', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  distance: { fontSize: 14, fontWeight: '600', color: '#888', marginBottom: 16 },
  tag: { backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start'},
  tagText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 }
});