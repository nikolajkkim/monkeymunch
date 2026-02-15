import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AnimatedReanimated from 'react-native-reanimated';
import { Animated } from 'react-native';
import { Deal } from '../types';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.8;

interface DealCardProps {
  deal: Deal;
  index: number;
  scrollX: Animated.Value;
}

export default function DealCard({ deal, index, scrollX }: DealCardProps) {
  
  const inputRange = [(index - 1) * CARD_WIDTH, index * CARD_WIDTH, (index + 1) * CARD_WIDTH];
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp' });
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale }], opacity }]}>
      <View style={styles.card}>
        
        <AnimatedReanimated.Image 
          source={{ uri: deal.image }} 
          style={styles.image} 
        />
        
        <TouchableOpacity style={styles.heartButton}>
          <Text style={styles.heartText}>♥</Text>
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text style={styles.distanceText}>{deal.distance}</Text>
          <Text style={styles.titleText}>{deal.title}</Text>
          <Text style={styles.restaurantText}>{deal.restaurant}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH - 20, 
    height: '100%',
  },
  image: {
    width: '100%',
    flex: 1,
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  heartText: {
    color: '#FF3B30',
    fontSize: 18,
    lineHeight: 20,
  },
  cardContent: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 0,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  restaurantText: {
    fontSize: 14,
    color: '#555',
  },
});