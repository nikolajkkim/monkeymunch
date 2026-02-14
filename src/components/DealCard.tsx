import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Deal } from '../types';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.8;

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Image source={{ uri: deal.image }} style={styles.image} />
        
        <TouchableOpacity style={styles.heartButton}>
          <Text style={styles.heartText}>♥</Text>
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text style={styles.distanceText}>{deal.distance}</Text>
          <Text style={styles.titleText}>{deal.title}</Text>
          <Text style={styles.restaurantText}>{deal.restaurant}</Text>
        </View>
      </View>
    </View>
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
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5, 
  },
  image: {
    width: '100%',
    height: '75%',
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
    padding: 16,
    height: '25%',
    justifyContent: 'center',
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