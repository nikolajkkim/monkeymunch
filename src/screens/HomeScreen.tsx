import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, 
  TextInput, FlatList, ViewToken, StatusBar, PanResponder 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Deal, RootStackScreenProps } from '../types';
import DealCard, { CARD_WIDTH } from '../components/DealCard';
import { ACTIVE_USER } from '../data/DummyData'; 
import { getRankedDeals } from '../utils/DealSorter';
import { ChevronDown, ChevronUp, Search, RefreshCw, X } from 'lucide-react-native';
import { getDeals } from '../lib/deals';
import { getDistanceMiles } from '../utils/Distance';
import { getUserCoords } from '../utils/GetUserCoords';

const { width } = Dimensions.get('window');
const SPACING = (width - CARD_WIDTH) / 2;
const ALIGNMENT_PADDING = SPACING + 10;

const LOOPS = 40; 

export default function HomeScreen({ navigation }: RootStackScreenProps<'Home'>) {
  //  ------------ DATA FETCHING -----------------
  const [deals, setDeals] = useState<Deal[]>([]);

  const loadDeals = async () => {
    try {
      const fetchedDeals = await getDeals();
      const userCoords = await getUserCoords();
      const dealsWithDistance = fetchedDeals
        .filter((deal) => deal.Restaurants)
        .map((deal) => ({
          ...deal,
          distance: getDistanceMiles(
            userCoords.latitude,
            userCoords.longitude,
            deal.Restaurants!.latitude,
            deal.Restaurants!.longitude
          ),
        }));
      setDeals(dealsWithDistance);
    } catch (error) {
      console.error('Error loading deals:', error);
    }
  };

  useEffect(() => { loadDeals(); }, []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const rankedInfiniteDeals = useMemo(() => {
    if (deals.length === 0) return [];

    const rankedBase = getRankedDeals(deals, ACTIVE_USER.timePreference);

    console.log("-----------------------------------------");
    console.log(`USER: ${ACTIVE_USER.name}`);
    console.log(`PREFERENCE: ${ACTIVE_USER.timePreference}`);
    console.log(`SYSTEM TIME: ${new Date().toLocaleTimeString()}`);
    console.log("-----------------------------------------");
    console.table(rankedBase.map((d, i) => ({
      Rank: i + 1,
      Restaurant: d.restaurant_id,
      Deal: d.title,
      Validity: d.meal_time
    })));
    console.log("-----------------------------------------");

    return Array.from({ length: LOOPS * rankedBase.length }, (_, i) => ({
      ...rankedBase[i % rankedBase.length],
      uniqueKey: `home-${i}`,
    }));
  }, [deals]); 

  const INITIAL_INDEX = Math.floor(rankedInfiniteDeals.length / 2);

  const [displayDeals, setDisplayDeals] = useState<typeof rankedInfiniteDeals>([]);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);

  // ✅ Fix: sync displayDeals when rankedInfiniteDeals populates
  useEffect(() => {
    if (rankedInfiniteDeals.length > 0) {
      setDisplayDeals(rankedInfiniteDeals);
      activeIndexRef.current = INITIAL_INDEX;
      setCurrentIndex(INITIAL_INDEX);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: INITIAL_INDEX, animated: false });
      }, 50);
    }
  }, [rankedInfiniteDeals]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isVerticalSwipe = Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5;
        return isVerticalSwipe && Math.abs(gestureState.dy) > 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -60) {
          const currentDeal = displayDeals[activeIndexRef.current];
          if (currentDeal) {
            navigation.navigate('DealDetails', { deal: currentDeal });
          }
        } else if (gestureState.dy > 60) {
          navigation.navigate('Map');
        }
      },
    })
  ).current;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsSearchOpen(false);
    setSearchQuery('');

    loadDeals().finally(() => {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: INITIAL_INDEX, animated: true });
        setIsRefreshing(false);
      }, 200);
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      handleRefresh();
    } else {
      const query = searchQuery.toLowerCase();

      const results = deals.filter(deal =>
        deal.title.toLowerCase().includes(query) ||
        deal.restaurant_id.toString().includes(query) ||
        deal.description.toLowerCase().includes(query)
      ).map((deal, i) => ({ ...deal, uniqueKey: `search-${i}` }));

      setDisplayDeals(results);

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 50);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);
      activeIndexRef.current = index;
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const baseCount = displayDeals.length > deals.length ? deals.length : displayDeals.length;
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

      {/* SEARCH OVERLAY */}
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
            initialScrollIndex={displayDeals.length > deals.length ? INITIAL_INDEX : 0}
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
  searchBarContainer: { 
    position: 'absolute', top: 90, left: 24, right: 24, 
    backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 20, height: 54, borderRadius: 27, zIndex: 20, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 
  },
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