/**
 * Cost Calculator for Tri Ton Tourism Itineraries
 */

export interface CostBreakdown {
  breakfastEst: number;
  lunchEst: number;
  dinnerEst: number;
  motorbikeRentalEst: number;
  fuelEst: number;
  ticketEst: number;
  stayEst: number;
  totalEstMin: number;
  totalEstMax: number;
  formattedRange: string;
}

/**
 * Calculate multi-category estimated costs for an itinerary
 */
export function calculateItineraryCost(
  daysCount: number = 1,
  poisCount: number = 4,
  isOvernight: boolean = false
): CostBreakdown {
  const breakfastEst = 35000 * daysCount;
  const lunchEst = 120000 * daysCount; // Gà đốt Ô Thum / Đặc sản
  const dinnerEst = 90000 * daysCount;  // Bò nướng / Chợ đêm
  const motorbikeRentalEst = 150000 * daysCount;
  const fuelEst = 50000 * daysCount;
  const ticketEst = 60000; // Đồi Tức Dụp 60k
  const stayEst = isOvernight ? 350000 : 0; // Homestay

  const totalMin = breakfastEst + lunchEst + dinnerEst + motorbikeRentalEst + fuelEst + ticketEst + stayEst;
  const totalMax = Math.round(totalMin * 1.25);

  const formatVnd = (num: number) => `${Math.round(num / 1000)}k`;

  return {
    breakfastEst,
    lunchEst,
    dinnerEst,
    motorbikeRentalEst,
    fuelEst,
    ticketEst,
    stayEst,
    totalEstMin: totalMin,
    totalEstMax: totalMax,
    formattedRange: `~${formatVnd(totalMin)} - ${formatVnd(totalMax)}/người`,
  };
}
