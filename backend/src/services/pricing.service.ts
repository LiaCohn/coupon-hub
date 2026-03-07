export class PricingService {
  /**
   * Calculate minimum sell price based on cost price and margin percentage
   * Formula: minimum_sell_price = cost_price * (1 + margin_percentage / 100)
   * 
   * @param costPrice - The cost price of the product
   * @param marginPercentage - The margin percentage to apply
   * @returns The calculated minimum sell price, rounded to 2 decimal places
   */
  calculateMinimumSellPrice(costPrice: number, marginPercentage: number): number {
    if (costPrice < 0 || marginPercentage < 0) {
      throw new Error('Cost price and margin percentage must be non-negative');
    }
    
    const minimumSellPrice = costPrice * (1 + marginPercentage / 100);
    
    // Round to 2 decimal places
    return Math.round(minimumSellPrice * 100) / 100;
  }

  /**
   * Validate that the reseller price meets the minimum sell price requirement
   * 
   * @param resellerPrice - The price offered by the reseller
   * @param minimumSellPrice - The minimum acceptable sell price
   * @returns true if valid, false otherwise
   */
  validateResellerPrice(resellerPrice: number, minimumSellPrice: number): boolean {
    return resellerPrice >= minimumSellPrice;
  }
}
