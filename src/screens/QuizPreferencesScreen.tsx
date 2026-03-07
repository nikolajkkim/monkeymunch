import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackScreenProps } from '../types';
import { supabase } from '../lib/supabase';

const PADDING_H = 24;

const CUISINES = [
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'American',
  'Thai',
  'Mediterranean',
  'French',
  'Korean',
];

const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner'];

export default function QuizPreferencesScreen({ navigation }: RootStackScreenProps<'QuizPreferences'>) {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedMealTime, setSelectedMealTime] = useState<string | null>(null);
  const [drinkDeals, setDrinkDeals] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const handleContinue = async () => {
    if (!selectedMealTime || drinkDeals === null) return;
  
    setError(null);
    setLoading(true);
    try {
      const { data, error: userError } = await supabase.auth.getUser();
  
      console.log('supabase.auth.getUser() result:', {
        data,
        userError,
      });
  
      if (userError) {
        throw userError;
      }
  
      if (!data || !data.user) {
        // No authenticated user – likely why it was failing
        console.log('No authenticated user found when saving preferences');
        throw new Error('No authenticated user. Please log in again.');
      }
  
      const user = data.user;
      console.log('Authenticated user for preferences:', {
        id: user.id,
        email: user.email,
      });
  
      // Log the choices before inserting
      console.log('Saving preferences for user:', {
        userId: user.id,
        cuisines: selectedCuisines,
        mealTime: selectedMealTime,
        drinkDeals,
      });
  
      const { error: prefsError } = await supabase.from('preferences').insert({
        user_id: user.id,
        cuisines: selectedCuisines,
        meal_time: selectedMealTime,
        drink_deals: drinkDeals,
      });
  
      if (prefsError) {
        console.log('Error inserting into preferences:', prefsError);
        throw prefsError;
      }
  
      console.log('Preferences saved successfully for user:', user.id);
      navigation.replace('Home');
    } catch (err: unknown) {
      console.log('handleContinue error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  const canContinue = selectedCuisines.length > 0 && selectedMealTime && drinkDeals !== null && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>munch</Text>
        <Text style={styles.subtitle}>Let's personalize your experience</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cuisine Preferences */}
        <View style={styles.section}>
          <Text style={styles.questionText}>What type of cuisine do you prefer?</Text>
          <Text style={styles.helperText}>Select all that apply</Text>
          
          <View style={styles.optionsGrid}>
            {CUISINES.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.cuisineOption,
                  selectedCuisines.includes(cuisine) && styles.cuisineOptionSelected,
                ]}
                onPress={() => toggleCuisine(cuisine)}
              >
                <Text
                  style={[
                    styles.cuisineText,
                    selectedCuisines.includes(cuisine) && styles.cuisineTextSelected,
                  ]}
                >
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Meal Time Preference */}
        <View style={styles.section}>
          <Text style={styles.questionText}>What's your favorite meal time?</Text>
          <Text style={styles.helperText}>Choose one</Text>
          
          <View style={styles.optionsColumn}>
            {MEAL_TIMES.map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.mealOption,
                  selectedMealTime === meal && styles.mealOptionSelected,
                ]}
                onPress={() => setSelectedMealTime(meal)}
              >
                <Text
                  style={[
                    styles.mealText,
                    selectedMealTime === meal && styles.mealTextSelected,
                  ]}
                >
                  {meal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Drink Deals */}
        <View style={styles.section}>
          <Text style={styles.questionText}>Are you a fan of drink deals?</Text>
          <Text style={styles.helperText}>Choose one</Text>
          
          <View style={styles.optionsColumn}>
            <TouchableOpacity
              style={[
                styles.mealOption,
                drinkDeals === true && styles.mealOptionSelected,
              ]}
              onPress={() => setDrinkDeals(true)}
            >
              <Text
                style={[
                  styles.mealText,
                  drinkDeals === true && styles.mealTextSelected,
                ]}
              >
                Yes, I love drink deals! 🍹
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.mealOption,
                drinkDeals === false && styles.mealOptionSelected,
              ]}
              onPress={() => setDrinkDeals(false)}
            >
              <Text
                style={[
                  styles.mealText,
                  drinkDeals === false && styles.mealTextSelected,
                ]}
              >
                No, not really
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'SAVING...' : 'CONTINUE'}
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.replace('Home')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  header: {
    paddingHorizontal: PADDING_H,
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  scroll: { 
    flex: 1 
  },
  content: {
    paddingHorizontal: PADDING_H,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 36,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cuisineOption: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cuisineOptionSelected: {
    backgroundColor: '#000',
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  cuisineTextSelected: {
    color: '#FFF',
  },
  optionsColumn: {
    gap: 12,
  },
  mealOption: {
    backgroundColor: '#FFF',
    borderRadius: 27,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  mealOptionSelected: {
    backgroundColor: '#000',
  },
  mealText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  mealTextSelected: {
    color: '#FFF',
  },
  continueButton: {
    backgroundColor: '#000',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { 
    opacity: 0.4 
  },
  continueButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
  skipButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '500',
    color: '#C00',
  },
});
