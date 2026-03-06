import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface Deal {
  id: string;
  title: string;
  restaurant: string;
  distance: string;
  image: string;
  type: string;
  description: string;
  validity: string;
  uniqueKey?: string;
}

export interface User {
  id: string;
  name: string;
  timePreference: 'breakfast' | 'lunch' | 'dinner' | 'all day';
}

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  QuizPreferences: undefined;
  Home: undefined;
  Map: undefined;
  DealDetails: { deal: Deal };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;