import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, TextInput, FlatList, ViewToken, StatusBar, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types';
import DealCard, { CARD_WIDTH } from '../components/DealCard';
import { DEALS } from '../data/DummyData'; 
import { ChevronDown, ChevronUp, Search, RefreshCw, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const SPACING = (width - CARD_WIDTH) / 2;
const ALIGNMENT_PADDING = SPACING + 10;

const LOOPS = 40; 
const INITIAL_INDEX = Math.floor((LOOPS * DEALS.length) / 2);

export default function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const infiniteDeals = useMemo(() => {
    return Array.from({ length: LOOPS * DEALS.length }, (_, i) => ({
      ...DEALS[i % DEALS.length],
      uniqueKey: `home-${i}`,
    }));
  }, []);

  const [displayDeals, setDisplayDeals] = useState(infiniteDeals);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(INITIAL_INDEX);

  // --- GESTURE NAVIGATION ---
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isVerticalSwipe = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5;
        return isVerticalSwipe && Math.abs(gestureState.dy) > 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -60) {
          const currentDeal = displayDeals[activeIndexRef.current];
          navigation.navigate('DealDetails', { deal: currentDeal });
        } else if (gestureState.dy > 60) {
          navigation.navigate('Map');
        }
      },
    })
  ).current;

  // --- REFRESH LOGIC ---
  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsSearchOpen(false);
    setSearchQuery('');
    setDisplayDeals(infiniteDeals);
    
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: INITIAL_INDEX, animated: true });
      setIsRefreshing(false);
    }, 200);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      handleRefresh();
    } else {
      const results = DEALS.filter(deal => 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.restaurant.toLowerCase().includes(searchQuery.toLowerCase())
      ).map((deal, i) => ({ ...deal, uniqueKey: `search-${i}` }));
      
      setDisplayDeals(results);
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 50);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      activeIndexRef.current = viewableItems[0].index;
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const baseCount = displayDeals.length > DEALS.length ? DEALS.length : displayDeals.length;
  const activeDotIndex = baseCount > 0 ? currentIndex % baseCount : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.logo}>munch</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate('Map')}>
          <Text style={styles.mapText}>SHOW MAP</Text>
          <ChevronDown color="#888" size={16} strokeWidth={2.5} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {isSearchOpen && (
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search deals..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={() => { setIsSearchOpen(false); handleRefresh(); }}>
            <X color="#888" size={20} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      )}

      {/* CAROUSEL */}
      <View style={styles.carouselWrapper} {...panResponder.panHandlers}>
        {!isRefreshing ? (
          <Animated.FlatList
            ref={flatListRef}
            data={displayDeals}
            keyExtractor={(item) => item.uniqueKey}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: SPACING }}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialScrollIndex={displayDeals.length > DEALS.length ? INITIAL_INDEX : 0}
            getItemLayout={(_, index) => ({
              length: CARD_WIDTH,
              offset: CARD_WIDTH * index,
              index,
            })}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                activeOpacity={1}
                onPress={() => navigation.navigate('DealDetails', { deal: item })}
              >
                <DealCard deal={item} index={index} scrollX={scrollX} />
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.loaderContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.sideButtonLeft} onPress={handleRefresh}>
          <RefreshCw color="#888" size={22} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.footerCenter}>
          <ChevronUp color="#888" size={24} strokeWidth={2.5} style={{ marginBottom: 12 }} />
          <View style={styles.pagination}>
            {Array.from({ length: baseCount }).map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  activeDotIndex === i ? styles.activeDot : styles.inactiveDot
                ]} 
              />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.sideButtonRight} onPress={() => setIsSearchOpen(true)}>
          <Search color="#888" size={22} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    paddingHorizontal: ALIGNMENT_PADDING, 
    paddingTop: 20,
    paddingBottom: 10
  },
  logo: { fontSize: 28, fontWeight: '900', color: '#000', letterSpacing: -1.5 },
  mapText: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 1, marginBottom: 6 },
  mapButton: { flexDirection: 'row', alignItems: 'center', paddingBottom: 2 },
  searchBarContainer: { position: 'absolute', top: 90, left: 24, right: 24, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 54, borderRadius: 27, zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#000', fontWeight: '500' },
  carouselWrapper: { flex: 1, justifyContent: 'center' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', fontWeight: '600', letterSpacing: 1 },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: ALIGNMENT_PADDING, 
    paddingBottom: 30 
  },
  footerCenter: { alignItems: 'center', flex: 1 },
  pagination: { flexDirection: 'row', alignItems: 'center' },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 4 },
  activeDot: { width: 20, backgroundColor: '#000' },
  inactiveDot: { width: 6, backgroundColor: '#CCC' },
  sideButtonLeft: { alignItems: 'flex-start', width: 44 },
  sideButtonRight: { alignItems: 'flex-end', width: 44 }
});