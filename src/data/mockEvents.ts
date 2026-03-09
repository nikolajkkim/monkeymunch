import { UserEvent, UserPreferences } from '../utils/PreferenceEngine';

// ============================================
// MOCK EVENT HISTORY
// Simulates what the database would return
// ============================================

export const MOCK_EVENTS: UserEvent[] = [
  // Steven clicked and saved sushi (japanese)
  { userId: 'u3', eventType: 'clicked', dealId: '5', cuisine: 'japanese', timestamp: new Date('2026-02-20') },
  { userId: 'u3', eventType: 'saved',   dealId: '5', cuisine: 'japanese', timestamp: new Date('2026-02-20') },

  // Steven clicked In-N-Out (american)
  { userId: 'u3', eventType: 'clicked', dealId: '2', cuisine: 'american', timestamp: new Date('2026-02-21') },

  // Steven just viewed boba (mild interest)
  { userId: 'u3', eventType: 'viewed',  dealId: '1', cuisine: 'boba',     timestamp: new Date('2026-02-22') },

  // Steven clicked and saved wontons (chinese)
  { userId: 'u3', eventType: 'clicked', dealId: '3', cuisine: 'chinese',  timestamp: new Date('2026-02-23') },
  { userId: 'u3', eventType: 'saved',   dealId: '3', cuisine: 'chinese',  timestamp: new Date('2026-02-23') },

  // Steven just viewed pizza (mild interest)
  { userId: 'u3', eventType: 'viewed',  dealId: '6', cuisine: 'italian',  timestamp: new Date('2026-02-24') },
];

// ============================================
// MOCK USER PREFERENCES
// Combines explicit picks + implicit behavior
// ============================================

export const MOCK_PREFERENCES: UserPreferences = {
  userId: 'u3',
  cuisines: ['japanese', 'chinese'],  // Steven explicitly picked these
  events: MOCK_EVENTS,
};

// ============================================
// EXPECTED SCORES (for testing/debugging)
//
// japanese: 10 (explicit) + 3 (click) + 5 (save) + 3 + 5 (direct) = 26
// chinese:  10 (explicit) + 3 (click) + 5 (save) + 3 + 5 (direct) = 26
// american: 0  (no explicit) + 3 (click) + 3 (direct)              = 6
// boba:     0  (no explicit) + 1 (view) + 1 (direct)               = 2
// italian:  0  (no explicit) + 1 (view) + 1 (direct)               = 2
// coffee:   0                                                       = 0
// mexican:  0                                                       = 0
// ============================================