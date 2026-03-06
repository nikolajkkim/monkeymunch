import { Deal } from '../types';
import { MOCK_PREFERENCES } from '../data';

// ============================================
// TYPES — will match your database later
// ============================================

export type EventType = 'viewed' | 'clicked' | 'saved' | 'unsaved';

export interface UserEvent {
  userId: string;
  eventType: EventType;
  dealId: string;
  cuisine: string;
  timestamp: Date;
}

export interface UserPreferences {
  userId: string;
  cuisines: string[];           // explicit: user picked these
  events: UserEvent[];          // implicit: tracked behavior
}

// ============================================
// EVENT WEIGHTS — tune these to change ranking
// ============================================

const EVENT_WEIGHTS: Record<EventType, number> = {
  viewed:   1,
  clicked:  3,
  saved:    5,
  unsaved: -3,
};

// ============================================
// SCORING WEIGHTS — must sum to 1.0
// ============================================

interface ScoringWeights {
  distance:     number;
  cuisineMatch: number;
  tagMatch:     number;
  timeOfDay:    number;
  rating:       number;
  popularity:   number;
  saves:        number;
}

const WEIGHTS: ScoringWeights = {
  distance:     0.25,
  cuisineMatch: 0.20,
  tagMatch:     0.10,
  timeOfDay:    0.15,
  rating:       0.10,
  popularity:   0.05,
  saves:        0.15,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse "0.3 MI AWAY" → 0.3
 */
function parseDistanceMiles(distance: string): number {
  const match = distance.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Calculate implicit score per cuisine from event history
 */
function getCuisineScores(events: UserEvent[]): Record<string, number> {
  const scores: Record<string, number> = {};
  events.forEach((event) => {
    const weight = EVENT_WEIGHTS[event.eventType] || 0;
    scores[event.cuisine] = (scores[event.cuisine] || 0) + weight;
  });
  return scores;
}

/**
 * Calculate implicit score per deal type (BOGO, Discount, etc.)
 */
function getTagScores(events: UserEvent[], deals: Deal[]): Record<string, number> {
  const scores: Record<string, number> = {};
  events.forEach((event) => {
    const deal = deals.find(d => d.id === event.dealId);
    if (deal) {
      const weight = EVENT_WEIGHTS[event.eventType] || 0;
      scores[deal.type] = (scores[deal.type] || 0) + weight;
    }
  });
  return scores;
}

/**
 * Check if a deal is valid right now based on time of day
 */
function isDealValidNow(deal: Deal): boolean {
  const hour = new Date().getHours();

  switch (deal.validity.toLowerCase()) {
    case 'valid all day':
      return true;
    case 'valid breakfast':
      return hour >= 6 && hour < 11;
    case 'valid lunch':
      return hour >= 11 && hour < 15;
    case 'valid dinner':
      return hour >= 17 && hour < 23;
    default:
      return true;
  }
}

// ============================================
// CORE SCORING ENGINE
// ============================================

/**
 * Score a single deal from 0–1 using all weighted factors
 */
function scoreDeal(deal: Deal, preferences: UserPreferences, allDeals: Deal[]): number {
  const cuisineScores = getCuisineScores(preferences.events);
  const tagScores = getTagScores(preferences.events, allDeals);

  // --- DISTANCE (closer = better) ---
  const maxDistance = 5.0;
  const distanceMiles = parseDistanceMiles(deal.distance);
  const distanceScore = 1 - (distanceMiles / maxDistance);

  // --- CUISINE MATCH (explicit + implicit) ---
  const maxCuisineScore = Math.max(...Object.values(cuisineScores), 1);
  const isExplicit = preferences.cuisines.includes(deal.cuisine);
  const implicitCuisine = (cuisineScores[deal.cuisine] || 0) / maxCuisineScore;
  const cuisineScore = isExplicit ? 1.0 : implicitCuisine;

  // --- TAG MATCH (deal type preference) ---
  const maxTagScore = Math.max(...Object.values(tagScores), 1);
  const tagScore = (tagScores[deal.type] || 0) / maxTagScore;

  // --- TIME OF DAY ---
  const timeScore = isDealValidNow(deal) ? 1.0 : 0.2;

  // --- RATING ---
  // TODO: add rating field to Deal type when backend is ready
  const ratingScore = 0.8; // placeholder

  // --- POPULARITY ---
  // TODO: get from database (total interactions across all users)
  const popularityScore = 0.5; // placeholder

  // --- SAVES (user's save count for this cuisine) ---
  const saveCount = preferences.events.filter(
    e => e.eventType === 'saved' && e.cuisine === deal.cuisine
  ).length;
  const allSaveCounts = preferences.cuisines.map(c =>
    preferences.events.filter(e => e.eventType === 'saved' && e.cuisine === c).length
  );
  const maxSaves = Math.max(...allSaveCounts, 1);
  const savesScore = saveCount / maxSaves;

  // --- FINAL WEIGHTED SCORE ---
  const finalScore =
    (WEIGHTS.distance     * distanceScore)   +
    (WEIGHTS.cuisineMatch * cuisineScore)    +
    (WEIGHTS.tagMatch     * tagScore)        +
    (WEIGHTS.timeOfDay    * timeScore)       +
    (WEIGHTS.rating       * ratingScore)     +
    (WEIGHTS.popularity   * popularityScore) +
    (WEIGHTS.saves        * savesScore);

  return finalScore;
}

// ============================================
// PUBLIC API — what your screens call
// ============================================

/**
 * Rank deals by personalized score.
 *
 * NOW:   uses mock data
 * LATER: swap MOCK_PREFERENCES with API call
 */
export function getPersonalizedDeals(deals: Deal[]): Deal[] {
  // TODO: Replace with API call
  // const preferences = await fetchUserPreferences(userId);
  const preferences = MOCK_PREFERENCES;

  const scored = deals.map((deal) => ({
    deal,
    score: scoreDeal(deal, preferences, deals),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Debug logging
  console.log('========= PREFERENCE ENGINE =========');
  console.table(scored.map((s, i) => ({
    Rank: i + 1,
    Restaurant: s.deal.restaurant,
    Cuisine: s.deal.cuisine,
    Score: s.score.toFixed(3),
  })));
  console.log('=====================================');

  return scored.map((s) => s.deal);
}

/**
 * Track a user event.
 *
 * NOW:   logs to console + pushes to mock array
 * LATER: send to database
 */
export function trackDealEvent(
  userId: string,
  eventType: EventType,
  deal: Deal
): void {
  const event: UserEvent = {
    userId,
    eventType,
    dealId: deal.id,
    cuisine: deal.cuisine,
    timestamp: new Date(),
  };

  // TODO: Replace with API call
  // await db.collection('user_events').add(event);

  console.log(`📊 TRACKED: ${eventType.toUpperCase()} → ${deal.restaurant} (${deal.cuisine})`);

  // Push to mock array so it affects ranking in current session
  MOCK_PREFERENCES.events.push(event);
}