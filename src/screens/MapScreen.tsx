import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types';

export default function MapScreen({ navigation }: RootStackScreenProps<'Map'>) {
  
  // Listen for an upward swipe to close the screen
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 20; 
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -50) {
          // Swiped UP -> Go back to Home
          navigation.goBack();
        }
      },
    })
  ).current;

  return (
    // Attach the panHandlers to the root wrapper
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>^ SWIPE UP TO CLOSE MAP</Text>
      </TouchableOpacity>
      
      <View style={styles.mapPlaceholder}>
        <Text style={styles.text}>Map Interface Will Go Here</Text>
        <Text style={styles.subtext}>(Irvine Area)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  closeButton: { padding: 20, alignItems: 'center' },
  closeText: { fontSize: 12, fontWeight: 'bold', color: '#888' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EAEAEA' },
  text: { fontSize: 20, fontWeight: 'bold' },
  subtext: { fontSize: 16, color: '#666', marginTop: 8 }
});