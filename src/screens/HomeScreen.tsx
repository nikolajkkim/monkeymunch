import React, { useRef, useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, PanResponder, StatusBar, ViewToken, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types';
import { DEALS } from '../data/DummyData';
import DealCard, { CARD_WIDTH } from '../components/DealCard';

const { width, height } = Dimensions.get('window');
const SPACING = (width - CARD_WIDTH) / 2;

const LOOPS = 100;
const START_LOOP = Math.floor(LOOPS / 2);
const INITIAL_INDEX = START_LOOP * DEALS.length; 

export default function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const [currentIndex, setCurrentIndex] = useState<number>(INITIAL_INDEX);
  const activeIndexRef = useRef(INITIAL_INDEX);
  
  const scrollX = useRef(new Animated.Value(INITIAL_INDEX * CARD_WIDTH)).current;
  const flatListRef = useRef<any>(null);

  const infiniteDeals = useMemo(() => {
    const arr = [];
    for (let i = 0; i < LOOPS; i++) {
      DEALS.forEach((item, index) => {
        arr.push({
          ...item,
          uniqueKey: `${item.id}-loop${i}-idx${index}`
        });
      });
    }
    return arr;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isVerticalSwipe = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5;
        return isVerticalSwipe && Math.abs(gestureState.dy) > 30;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -50) {
          const currentDeal = infiniteDeals[activeIndexRef.current];
          navigation.navigate('DealDetails', { deal: currentDeal });
        } else if (gestureState.dy > 50) {
          navigation.navigate('Map');
        }
      },
    })
  ).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      activeIndexRef.current = viewableItems[0].index;
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const realDotIndex = currentIndex % DEALS.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>Munch</Text>
        <TouchableOpacity 
          style={styles.mapButton} 
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.mapText}>SHOW MAP</Text>
          <ChevronDown color="#888" size={16} strokeWidth={2.5} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.carouselWrapper} {...panResponder.panHandlers}>
        <Animated.FlatList
          ref={flatListRef}
          data={infiniteDeals}
          renderItem={({ item, index }) => <DealCard deal={item} index={index} scrollX={scrollX} />}
          keyExtractor={(item) => item.uniqueKey}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH} 
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: SPACING }} 
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          initialScrollIndex={INITIAL_INDEX}
          getItemLayout={(data, index) => ({
            length: CARD_WIDTH,
            offset: CARD_WIDTH * index,
            index,
          })}
        />
      </View>

      <View style={styles.footer}>
        <ChevronUp color="#888" size={24} strokeWidth={2.5} style={{ marginBottom: 10 }} />
        <View style={styles.pagination}>
          {DEALS.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, realDotIndex === index ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: SPACING + 10, paddingTop: 40, paddingBottom: 20 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  mapButton: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6 },
  mapText: { fontSize: 12, fontWeight: '600', color: '#888', letterSpacing: 1, marginBottom: 6 },
  carouselWrapper: { height: height * 0.73 }, 
  footer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 10 },
  upArrow: { fontSize: 24, color: '#888', marginBottom: 10 },
  pagination: { flexDirection: 'row' },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 4 },
  activeDot: { width: 20, backgroundColor: '#000' },
  inactiveDot: { width: 6, backgroundColor: '#CCC' },
});