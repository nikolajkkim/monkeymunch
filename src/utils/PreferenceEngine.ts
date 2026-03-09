import { Deal } from '../types';
import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export type EventType = 'clicked' | 'saved' | 'unsaved';

export interface UserEvent {
  userId: string;
  eventType: EventType;
  dealId: number;
  tag: string;         // cuisine tag e.g. "Italian", "Mexican"
  timestamp: Date;
}

export interface UserPreferences {
  userId: string;
  tags: string[];      // explicit: cuisines user picked in preferences
  events: UserEvent[]; // implicit: tracked behavior
}

// ============================================
// EVENT WEIGHTS
// ============================================

const EVENT_WEIGHTS: Record<EventType, number> = {
  clicked:  3,
  saved:    5,
  unsaved: -3,
};

// ============================================
// SCORING WEIGHTS — must sum to 1.0
// ============================================

interface ScoringWeights {
  distance:      number;
  tagMatch:      number;
  dealTypeMatch: number;
  timeOfDay:     number;
  rating:        number;
  popularity:    number;
  saves:         number;
}

const WEIGHTS: ScoringWeights = {
  distance:      0.25,
  tagMatch:      0.20,
  dealTypeMatch: 0.10,
  timeOfDay:     0.15,
  rating:        0.10,
  popularity:    0.05,
  saves:         0.15,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate implicit score per tag (cuisine) from event history
 */
function getTagScores(events: UserEvent[]): Record<string, number> {
  const scores: Record<string, number> = {};
  events.forEach((event) => {
    const weight = EVENT_WEIGHTS[event.eventType] || 0;
    scores[event.tag] = (scores[event.tag] || 0) + weight;
  });
  return scores;
}

/**
 * Calculate implicit score per deal_type from event history
 */
function getDealTypeScores(events: UserEvent[], deals: Deal[]): Record<string, number> {
  const scores: Record<string, number> = {};
  events.forEach((event) => {
    const deal = deals.find(d => d.deal_id === event.dealId);
    if (deal) {
      const weight = EVENT_WEIGHTS[event.eventType] || 0;
      scores[deal.deal_type] = (scores[deal.deal_type] || 0) + weight;
    }
  });
  return scores;
}

/**
 * Check if the restaurant is open right now using RestaurantHours.
 * Returns false if no hours found for today (treated as closed).
 */
function isRestaurantOpenNow(deal: Deal): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();                  // 0 = Sunday, 6 = Saturday
  const currentTime = now.toTimeString().slice(0, 8); // "HH:MM:SS"

  const hours = deal.Restaurants?.RestaurantHours ?? [];
  const todayHours = hours.find(h => h.day_of_week === dayOfWeek);

  if (!todayHours) return false;
  return currentTime >= todayHours.open_time && currentTime <= todayHours.close_time;
}

/**
 * Check if a deal is relevant to the current meal time.
 */
function isDealValidNow(deal: Deal): boolean {
  const hour = new Date().getHours();

  switch (deal.meal_time.toLowerCase()) {
    case 'all day':
      return true;
    case 'breakfast':
      return hour >= 6 && hour < 11;
    case 'lunch':
      return hour >= 11 && hour < 15;
    case 'dinner':
      return hour >= 17 && hour < 23;
    default:
      return true;
  }
}

// ============================================
// CORE SCORING ENGINE
// ============================================

/**
 * Score a single deal from 0–1 using all weighted factors.
 */
function scoreDeal(
  deal: Deal,
  preferences: UserPreferences,
  allDeals: Deal[],
  popularityMap: Record<number, number>,
): number {
  const tagScores      = getTagScores(preferences.events);
  const dealTypeScores = getDealTypeScores(preferences.events, allDeals);

  // --- DISTANCE (closer = better) ---
  const maxDistance = 5.0;
  const distanceScore = 1 - Math.min(deal.distance / maxDistance, 1);

  // --- TAG MATCH (explicit + implicit cuisine) ---
  const maxTagScore = Math.max(...Object.values(tagScores), 1);
  const isExplicit = preferences.tags.includes(deal.tag);
  const implicitTag = Math.max((tagScores[deal.tag] || 0) / maxTagScore, 0);
  const tagMatchScore = isExplicit ? 1.0 : implicitTag;

  // --- DEAL TYPE MATCH (click/save behavior on deal types) ---
  const maxDealTypeScore = Math.max(...Object.values(dealTypeScores), 1);
  const dealTypeScore = Math.max((dealTypeScores[deal.deal_type] || 0) / maxDealTypeScore, 0);

  // --- TIME OF DAY (restaurant open + meal time relevance) ---
  // 1.0 = open and right meal time
  // 0.5 = open but wrong meal time
  // 0.2 = restaurant is closed
  const isOpen = isRestaurantOpenNow(deal);
  const isRelevantTime = isDealValidNow(deal);
  const timeScore = isOpen ? (isRelevantTime ? 1.0 : 0.5) : 0.2;

  // --- RATING (from Restaurants join) ---
  const rating = deal.Restaurants?.rating ?? 3.0;
  const ratingScore = rating / 5.0;

  // --- POPULARITY (from deal_popularity view) ---
  const maxPopularity = Math.max(...Object.values(popularityMap), 1);
  const popularityScore = (popularityMap[deal.deal_id] || 0) / maxPopularity;

  // --- SAVES (user's save count for this tag) ---
  const saveCount = preferences.events.filter(
    e => e.eventType === 'saved' && e.tag === deal.tag
  ).length;
  const allSaveCounts = preferences.tags.map(t =>
    preferences.events.filter(e => e.eventType === 'saved' && e.tag === t).length
  );
  const maxSaves = Math.max(...allSaveCounts, 1);
  const savesScore = saveCount / maxSaves;

  // --- FINAL WEIGHTED SCORE ---
  return (
    (WEIGHTS.distance      * distanceScore)   +
    (WEIGHTS.tagMatch      * tagMatchScore)   +
    (WEIGHTS.dealTypeMatch * dealTypeScore)   +
    (WEIGHTS.timeOfDay     * timeScore)       +
    (WEIGHTS.rating        * ratingScore)     +
    (WEIGHTS.popularity    * popularityScore) +
    (WEIGHTS.saves         * savesScore)
  );
}

// ============================================
// DATA FETCHING
// ============================================

/**
 * Fetch the current user's explicit tag preferences and event history.
 */
async function fetchUserPreferences(userId: string): Promise<UserPreferences> {
  const { data: prefData, error: prefError } = await supabase
    .from('preferences')
    .select('preferences')
    .eq('user_id', userId)
    .maybeSingle();

  if (prefError) console.error('Error fetching preferences:', prefError);

  const { data: eventData, error: eventError } = await supabase
    .from('user_events')
    .select('event_type, deal_id, cuisine, created_at')
    .eq('user_id', userId);

  if (eventError) console.error('Error fetching user events:', eventError);

  const events: UserEvent[] = (eventData ?? []).map((row) => ({
    userId,
    eventType: row.event_type as EventType,
    dealId: row.deal_id,
    tag: row.cuisine,  // stored as "cuisine" in user_events, maps to deal.tag
    timestamp: new Date(row.created_at),
  }));

  return {
    userId,
    tags: prefData?.preferences ?? [],
    events,
  };
}

/**
 * Fetch popularity counts for all deals from the deal_popularity view.
 */
async function fetchPopularityMap(): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from('deal_popularity')
    .select('deal_id, interaction_count');

  if (error) console.error('Error fetching popularity:', error);

  const map: Record<number, number> = {};
  (data ?? []).forEach((row) => {
    map[row.deal_id] = Number(row.interaction_count);
  });
  return map;
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Rank deals by personalized score for the current user.
 */
export async function getPersonalizedDeals(
  deals: Deal[],
  userId: string,
): Promise<Deal[]> {
  const [preferences, popularityMap] = await Promise.all([
    fetchUserPreferences(userId),
    fetchPopularityMap(),
  ]);

  const scored = deals.map((deal) => ({
    deal,
    score: scoreDeal(deal, preferences, deals, popularityMap),
  }));

  scored.sort((a, b) => b.score - a.score);

  console.log('========= PREFERENCE ENGINE =========');
  console.table(scored.map((s, i) => ({
    Rank: i + 1,
    Restaurant: s.deal.Restaurants?.name ?? 'Unknown',
    Tag: s.deal.tag,
    Open: isRestaurantOpenNow(s.deal),
    Score: s.score.toFixed(3),
  })));
  console.log('=====================================');

  return scored.map((s) => s.deal);
}

/**
 * Track a user interaction event and write it to Supabase.
 */
export async function trackDealEvent(
  userId: string,
  eventType: EventType,
  deal: Deal,
): Promise<void> {
  const { error } = await supabase.from('user_events').insert({
    user_id: userId,
    deal_id: deal.deal_id,
    cuisine: deal.tag,   // store deal.tag in the cuisine column
    event_type: eventType,
  });

  if (error) {
    console.error('Error tracking event:', error);
    return;
  }

  console.log(`📊 TRACKED: ${eventType.toUpperCase()} → ${deal.Restaurants?.name ?? deal.deal_id} (${deal.tag})`);
}