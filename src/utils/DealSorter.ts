import { Deal } from '../types';

export const getRankedDeals = (deals: Deal[], preferredTime?: string): Deal[] => {
  const now = new Date();
  const currentHour = now.getHours();

  let currentMealTime = 'all day';
  if (currentHour >= 5 && currentHour < 11) currentMealTime = 'breakfast';
  else if (currentHour >= 11 && currentHour < 16) currentMealTime = 'lunch';
  else if (currentHour >= 16 && currentHour < 21) currentMealTime = 'dinner';
  else currentMealTime = 'dinner';

  return [...deals].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    const distA = parseFloat(a.distance);
    const distB = parseFloat(b.distance);
    scoreA -= distA * 10;
    scoreB -= distB * 10;

    if (a.validity.toLowerCase().includes(currentMealTime)) scoreA += 30;
    if (b.validity.toLowerCase().includes(currentMealTime)) scoreB += 30;

    if (preferredTime) {
      if (a.validity.toLowerCase().includes(preferredTime.toLowerCase())) scoreA += 60;
      if (b.validity.toLowerCase().includes(preferredTime.toLowerCase())) scoreB += 60;
    }

    return scoreB - scoreA;
  });
};