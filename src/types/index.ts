import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface Deal {
  id: string;
  title: string;
  restaurant: string;
  distance: string;
  image: string;
  type: string;
}

// 1. Define the routes in your app and the params they take
export type RootStackParamList = {
  Home: undefined; // Home needs no extra data
  Map: undefined;  // Map needs no extra data
  DealDetails: { deal: Deal }; // Details MUST be passed a Deal object
};

// 2. Create a reusable type for your screen props
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;