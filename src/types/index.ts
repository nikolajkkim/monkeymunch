import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Deal = {
  deal_id: number;
  restaurant_id: number;
  title: string;
  description: string;
  deal_type: string;
  start_time: string;
  end_time: string;
  meal_time: string;
  is_active: boolean;
  tag: string;
  Restaurants: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
    RestaurantHours: {
      day_of_week: number;
      open_time: string;
      close_time: string;
    }[];
  } | null;
  distance: number;
  image_url: string;
};

export type RankedDeal = Deal & {
  distance: number;
};

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