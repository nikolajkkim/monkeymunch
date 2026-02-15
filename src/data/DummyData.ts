import { Deal } from '../types';

export const DEALS: Deal[] = [
  {
    id: '1',
    title: 'Matcha Latte',
    restaurant: 'Hidden House Coffee',
    distance: '0.5 MI AWAY',
    image: 'https://images.unsplash.com/photo-1749280447307-31a68eb38673?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80',
    type: 'Discount',
    description: 'Premium ceremonial-grade matcha. Buy one, get one free on all sizes.',
    validity: 'Valid until 2pm',
  },
  {
    id: '2',
    title: 'Student Combo Discount',
    restaurant: 'In-N-Out Burger',
    distance: '1.2 MI AWAY',
    image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80',
    type: 'Discount',
    description: 'Get a Double-Double, fries, and a drink for 15% off with a valid UCI student ID.',
    validity: 'Valid all day',
  },
  {
    id: '3',
    title: 'Half-Off Boba',
    restaurant: '7 Leaves Cafe',
    distance: '2.1 MI AWAY',
    image: 'https://images.unsplash.com/photo-1637273484213-3b41dfbdcf99?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80',
    type: 'Discount',
    description: 'Buy any size drink and get a regular boba milk tea for half price.',
    validity: 'Valid 2pm - 5pm',
  }
];