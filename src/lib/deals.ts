import { supabase } from './supabase';

export async function getDeals(){
  const { data, error } = await supabase
    .from('Deals')
    .select('*, Restaurants(name, address, latitude, longitude, rating, RestaurantHours(day_of_week, open_time, close_time))')

  if (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }

  return data ?? [];
}
