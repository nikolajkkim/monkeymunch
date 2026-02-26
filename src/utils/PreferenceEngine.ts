// utils/PreferenceEngine.ts

import { Deal } from '../types';

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
// WEIGHTS — tune these to change ranking
// ============================================

const EVENT_WEIGHTS: Record<EventType, number> = {
  viewed:   1,
  clicked:  3,
  saved:    5,
  unsaved: -3,
};

// ============================================
// DUMMY DATA — replace with API calls later
// ============================================

const DUMMY_EVENTS: UserEvent[] = [
  { userId: 'u3', eventType: 'clicked', dealId: '5', cuisine: 'japanese',  timestamp: new Date() },
  { userId: 'u3', eventType: 'saved',   dealId: '5', cuisine: 'japanese',  timestamp: new Date() },
  { userId: 'u3', eventType: 'clicked', dealId: '2', cuisine: 'american',  timestamp: new Date() },
  { userId: 'u3', eventType: 'viewed',  dealId: '1', cuisine: 'boba',      timestamp: new Date() },
  { userId: 'u3', eventType: 'clicked', dealId: '3', cuisine: 'chinese',   timestamp: new Date() },
  { userId: 'u3', eventType: 'saved',   dealId: '3', cuisine: 'chinese',   timestamp: new Date() },
  { userId: 'u3', eventType: 'viewed',  dealId: '6', cuisine: 'italian',   timestamp: new Date() },
];

const DUMMY_PREFERENCES: UserPreferences = {
  userId: 'u3',
  cuisines: ['japanese', 'chinese'],   // Steven explicitly said he likes these
  events: DUMMY_EVENTS,
};

// ============================================
// CORE ENGINE
// ============================================

/**
 * Calculate a score for each cuisine based on user behavior.
 * Higher score = user likes this cuisine more.
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
 * Get a bonus for explicitly preferred cuisines.
 * This ensures user-selected cuisines always get a boost.
 */
function getExplicitBonus(cuisines: string[]): Record<string, number> {
  const bonus: Record<string, number> = {};
  cuisines.forEach((c) => {
    bonus[c] = 10; // explicit preference = big boost
  });
  return bonus;
}

/**
 * Score a single deal based on user preferences.
 * Returns a number — higher = more relevant to user.
 */
function scoreDeal(deal: Deal, preferences: UserPreferences): number {
  let score = 0;

  const cuisineScores = getCuisineScores(preferences.events);
  const explicitBonus = getExplicitBonus(preferences.cuisines);

  // You'll need to add a `cuisine` field to your Deal type
  // For now, we'll use a mapping
  const dealCuisine = getDealCuisine(deal);

  // Implicit score (from clicks/saves/views)
  score += cuisineScores[dealCuisine] || 0;

  // Explicit score (from user-selected cuisines)
  score += explicitBonus[dealCuisine] || 0;

  // Direct interaction bonus: did user interact with THIS specific deal?
  preferences.events.forEach((event) => {
    if (event.dealId === deal.id) {
      score += EVENT_WEIGHTS[event.eventType] || 0;
    }
  });

  return score;
}

/**
 * TEMPORARY: Map deal to cuisine.
 * Replace this when you add `cuisine` field to your Deal type.
 */
function getDealCuisine(deal: Deal): string {
  const cuisineMap: Record<string, string> = {
    '1': 'boba',
    '2': 'american',
    '3': 'chinese',
    '4': 'american',
    '5': 'japanese',
    '6': 'italian',
    '7': 'coffee',
    '8': 'mexican',
  };
  return cuisineMap[deal.id] || 'unknown';
}

// ============================================
// PUBLIC API — what your screens will call
// ============================================

/**
 * Rank deals by user preference score.
 * 
 * RIGHT NOW: uses dummy data
 * LATER: swap DUMMY_PREFERENCES with API call
 * 
 * Usage:
 *   const ranked = getPersonalizedDeals(DEALS);
 */
export function getPersonalizedDeals(deals: Deal[]): Deal[] {
  // TODO: Replace with API call
  // const preferences = await fetchUserPreferences(userId);
  const preferences = DUMMY_PREFERENCES;

  const scored = deals.map((deal) => ({
    deal,
    score: scoreDeal(deal, preferences),
  }));

  // Sort by score descending (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Debug logging
  console.log('========= PREFERENCE ENGINE =========');
  console.table(scored.map((s, i) => ({
    Rank: i + 1,
    Restaurant: s.deal.restaurant,
    Cuisine: getDealCuisine(s.deal),
    Score: s.score,
  })));
  console.log('=====================================');

  return scored.map((s) => s.deal);
}

/**
 * Track a user event.
 * 
 * RIGHT NOW: just logs to console
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
    cuisine: getDealCuisine(deal),
    timestamp: new Date(),
  };

  // TODO: Replace with API call
  // await db.collection('user_events').add(event);

  console.log(`📊 TRACKED: ${eventType.toUpperCase()} → ${deal.restaurant} (${getDealCuisine(deal)})`);

  // For now, push to dummy array so it affects ranking in current session
  DUMMY_EVENTS.push(event);
}