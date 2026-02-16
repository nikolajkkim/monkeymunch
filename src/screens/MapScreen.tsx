import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types';
import { ChevronUp } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export default function MapScreen({ navigation }: RootStackScreenProps<'Map'>) {
  
  const translateY = useRef(new Animated.Value(-height)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
      easing: (t) => t * (2 - t), 
    }).start();
  }, []);

  const slideUpAndClose = () => {
    Animated.timing(translateY, {
      toValue: -height,
      duration: 450,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Home');
        }
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dy < -20 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx); 
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -50) {
          slideUpAndClose();
        }
      },
    })
  ).current;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
      <SafeAreaView style={styles.container}>
        
        <View style={styles.mapPlaceholder}>
          <Text style={styles.text}>Map Interface Will Go Here</Text>
          <Text style={styles.subtext}>(Irvine Area)</Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={slideUpAndClose}>
          <ChevronUp color="#888" size={24} strokeWidth={2.5} style={{ marginBottom: 10 }} />
        </TouchableOpacity>

      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  container: { 
    flex: 1, 
    justifyContent: 'space-between'
  },
  mapPlaceholder: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#EAEAEA',
    margin: 16,
  },
  text: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#111'
  },
  subtext: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 8 
  },
  closeButton: { 
    padding: 20, 
    alignItems: 'center',
    paddingBottom: 40,
  },
  closeText: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#888', 
    letterSpacing: 1, 
    marginTop: 4 
  },
});