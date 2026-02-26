import { User } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Ryan',    timePreference: 'breakfast' },
  { id: 'u2', name: 'Nikolaj', timePreference: 'dinner'    },
  { id: 'u3', name: 'Steven',  timePreference: 'lunch'     },
  { id: 'u4', name: 'Luke',    timePreference: 'all day'   },
];

export const ACTIVE_USER = USERS[2]; // Steven