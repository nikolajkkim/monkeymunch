import React, { useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, PanResponder 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { RootStackScreenProps } from '../types';
import { DEALS } from '../data/DummyData';
import { X, ChevronUp, MapPin } from 'lucide-react-native';

const { height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 33.6405,
  longitude: -117.8443,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export default function MapScreen({ navigation }: RootStackScreenProps<'Map'>) {
  const translateY = useRef(new Animated.Value(-height)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const slideUpAndClose = () => {
    Animated.timing(translateY, {
      toValue: -height,
      duration: 400,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && navigation.canGoBack()) {
        navigation.goBack();
      }
    });
  };

  const footerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy < -10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -30) {
          slideUpAndClose();
        }
      },
    })
  ).current;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={slideUpAndClose}>
            <X color="#000" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby Munchies</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* MAP CONTAINER */}
        <View style={styles.mapWrapper}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={INITIAL_REGION}
          >
            {DEALS.map((deal, index) => (
              <Marker
                key={deal.deal_id}
                coordinate={{
                  latitude: INITIAL_REGION.latitude + (index === 0 ? 0.005 : index === 1 ? -0.008 : 0.002),
                  longitude: INITIAL_REGION.longitude + (index === 0 ? -0.005 : index === 1 ? 0.01 : -0.012),
                }}
                onPress={() => navigation.navigate('DealDetails', { deal })}
              >
                <View style={styles.customMarker}>
                  <View style={styles.pinBubble}>
                    <Text style={styles.pinText}>{deal.restaurant_id}</Text>
                  </View>
                  <View style={styles.pinIconContainer}>
                    <MapPin color="#000" size={34} fill="#000" strokeWidth={1} />
                    <View style={styles.whiteDot} />
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* FOOTER */}
        <View 
          style={styles.footer} 
          {...footerPanResponder.panHandlers}
        >
          <TouchableOpacity 
            style={styles.swipeHint} 
            onPress={slideUpAndClose}
            activeOpacity={0.7}
          >
            <ChevronUp color="#888" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: '#FFF', 
    zIndex: 100 
  },
  safeArea: { 
    flex: 1, 
    justifyContent: 'space-between' 
  },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -0.5
  },
  closeButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#F5F5F5', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  mapWrapper: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 10,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#EEE'
  },
  footer: { 
    alignItems: 'center', 
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: '#FFF'
  },
  swipeHint: { 
    alignItems: 'center', 
    padding: 12,
    width: '100%'
  },
  swipeText: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: '#888', 
    marginTop: 4, 
    letterSpacing: 1 
  },
  customMarker: { alignItems: 'center', justifyContent: 'center' },
  pinIconContainer: { alignItems: 'center', justifyContent: 'center' },
  whiteDot: {
    position: 'absolute',
    top: 8,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#FFF',
  },
  pinBubble: {
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: -1, 
    zIndex: 1,
  },
  pinText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  }
});