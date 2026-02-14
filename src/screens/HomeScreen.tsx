import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, FlatList, TouchableOpacity, PanResponder, StatusBar, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types';
import { DEALS } from '../data/DummyData';
import DealCard, { CARD_WIDTH } from '../components/DealCard';

const { width, height } = Dimensions.get('window');
const SPACING = (width - CARD_WIDTH) / 2;

// 1. Add the navigation prop here
export default function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // 2. We need a ref to track the active index because PanResponder doesn't read fresh state
  const activeIndexRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        // 3. Trigger the navigation!
        if (gestureState.dy < -50) {
          // Swiped UP -> Go to Details, passing the currently focused deal
          const currentDeal = DEALS[activeIndexRef.current];
          navigation.navigate('DealDetails', { deal: currentDeal });
        } else if (gestureState.dy > 50) {
          // Swiped DOWN -> Go to Map
          navigation.navigate('Map');
        }
      },
    })
  ).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      activeIndexRef.current = viewableItems[0].index; // Keep ref in sync
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>Munch</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Map')}>
          <Text style={styles.mapText}>SHOW MAP ⌄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.carouselWrapper} {...panResponder.panHandlers}>
        <FlatList
          data={DEALS}
          renderItem={({ item }) => <DealCard deal={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH} 
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: SPACING }} 
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.upArrow}>^</Text>
        <View style={styles.pagination}>
          {DEALS.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  mapText: { fontSize: 12, fontWeight: '600', color: '#888', letterSpacing: 1, marginBottom: 6 },
  carouselWrapper: { height: height * 0.65 },
  footer: { alignItems: 'center', paddingVertical: 20 },
  upArrow: { fontSize: 24, color: '#888', marginBottom: 10 },
  pagination: { flexDirection: 'row' },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 4 },
  activeDot: { width: 20, backgroundColor: '#000' },
  inactiveDot: { width: 6, backgroundColor: '#CCC' },
});