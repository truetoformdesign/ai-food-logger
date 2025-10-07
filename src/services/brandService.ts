export interface BrandInfo {
  name: string;
  icon: string;
  color: string;
}

export class BrandService {
  private brandMap: Map<string, BrandInfo> = new Map([
    // Coffee Shops
    ['starbucks', { name: 'Starbucks', icon: '☕', color: '#00704A' }],
    ['pret', { name: 'Pret A Manger', icon: '🥐', color: '#E31837' }],
    ['costa', { name: 'Costa Coffee', icon: '☕', color: '#4A4A4A' }],
    ['nero', { name: 'Caffe Nero', icon: '☕', color: '#1E3A8A' }],
    
    // Fast Food
    ['mcdonalds', { name: 'McDonald\'s', icon: '🍟', color: '#FFC72C' }],
    ['kfc', { name: 'KFC', icon: '🍗', color: '#E4002B' }],
    ['burger king', { name: 'Burger King', icon: '🍔', color: '#FF6600' }],
    ['subway', { name: 'Subway', icon: '🥪', color: '#00A651' }],
    ['pizza hut', { name: 'Pizza Hut', icon: '🍕', color: '#FF6600' }],
    ['dominos', { name: 'Domino\'s', icon: '🍕', color: '#E31837' }],
    
    // Supermarkets
    ['tesco', { name: 'Tesco', icon: '🛒', color: '#00539F' }],
    ['sainsburys', { name: 'Sainsbury\'s', icon: '🛒', color: '#FF6900' }],
    ['asda', { name: 'ASDA', icon: '🛒', color: '#68A51B' }],
    ['morrisons', { name: 'Morrisons', icon: '🛒', color: '#00539F' }],
    ['waitrose', { name: 'Waitrose', icon: '🛒', color: '#4A4A4A' }],
    
    // Brands
    ['cadbury', { name: 'Cadbury', icon: '🍫', color: '#4A4A4A' }],
    ['mars', { name: 'Mars', icon: '🍫', color: '#E31837' }],
    ['snickers', { name: 'Snickers', icon: '🍫', color: '#4A4A4A' }],
    ['kit kat', { name: 'Kit Kat', icon: '🍫', color: '#E31837' }],
    ['coca cola', { name: 'Coca Cola', icon: '🥤', color: '#E31837' }],
    ['pepsi', { name: 'Pepsi', icon: '🥤', color: '#004B93' }],
  ]);

  /**
   * Detect brand from context string
   * @param context - The context string (e.g., "from Pret", "McDonald's")
   * @returns BrandInfo | null
   */
  detectBrand(context: string | null): BrandInfo | null {
    if (!context) return null;
    
    const lowerContext = context.toLowerCase();
    
    // Direct match
    for (const [brandKey, brandInfo] of this.brandMap) {
      if (lowerContext.includes(brandKey)) {
        return brandInfo;
      }
    }
    
    // Partial matches
    if (lowerContext.includes('mcdonald') || lowerContext.includes('mcd')) {
      return this.brandMap.get('mcdonalds') || null;
    }
    
    if (lowerContext.includes('burger king') || lowerContext.includes('bk')) {
      return this.brandMap.get('burger king') || null;
    }
    
    if (lowerContext.includes('pizza hut') || lowerContext.includes('ph')) {
      return this.brandMap.get('pizza hut') || null;
    }
    
    return null;
  }

  /**
   * Get all available brands
   * @returns BrandInfo[]
   */
  getAllBrands(): BrandInfo[] {
    return Array.from(this.brandMap.values());
  }
}
