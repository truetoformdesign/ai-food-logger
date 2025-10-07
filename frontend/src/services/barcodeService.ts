// Barcode service for looking up food product information
import { FoodItem } from '../types';

interface BarcodeProduct {
  name: string;
  brand?: string;
  calories?: number;
  servingSize?: string;
  description?: string;
}

export class BarcodeService {
  // Mock database of common food products by barcode
  private productDatabase: Map<string, BarcodeProduct> = new Map([
    // Common UK/EU barcodes for demonstration
    ['5010123456789', {
      name: 'Cadbury Dairy Milk Chocolate Bar',
      brand: 'Cadbury',
      calories: 240,
      servingSize: '45g',
      description: 'Milk chocolate bar'
    }],
    ['5010123456790', {
      name: 'Coca-Cola Classic',
      brand: 'Coca-Cola',
      calories: 140,
      servingSize: '330ml',
      description: 'Classic cola drink'
    }],
    ['5010123456791', {
      name: 'Walkers Ready Salted Crisps',
      brand: 'Walkers',
      calories: 132,
      servingSize: '25g',
      description: 'Ready salted potato crisps'
    }],
    ['5010123456792', {
      name: 'Heinz Baked Beans',
      brand: 'Heinz',
      calories: 99,
      servingSize: '200g',
      description: 'Baked beans in tomato sauce'
    }],
    ['5010123456793', {
      name: 'McVitie\'s Digestive Biscuits',
      brand: 'McVitie\'s',
      calories: 71,
      servingSize: '14g',
      description: 'Original digestive biscuits'
    }],
    ['5010123456794', {
      name: 'Tesco Finest Sourdough Bread',
      brand: 'Tesco',
      calories: 80,
      servingSize: '1 slice',
      description: 'Artisan sourdough bread'
    }],
    ['5010123456795', {
      name: 'Ben & Jerry\'s Chocolate Fudge Brownie',
      brand: 'Ben & Jerry\'s',
      calories: 250,
      servingSize: '100ml',
      description: 'Ice cream with chocolate fudge brownie pieces'
    }],
    ['5010123456796', {
      name: 'Red Bull Energy Drink',
      brand: 'Red Bull',
      calories: 45,
      servingSize: '250ml',
      description: 'Energy drink with caffeine and taurine'
    }],
    ['5010123456797', {
      name: 'Quaker Oats Original',
      brand: 'Quaker',
      calories: 150,
      servingSize: '40g',
      description: 'Rolled oats for porridge'
    }],
    ['5010123456798', {
      name: 'Nestle KitKat 4 Finger',
      brand: 'Nestle',
      calories: 209,
      servingSize: '41.5g',
      description: 'Chocolate wafer fingers'
    }]
  ]);

  /**
   * Look up product information by barcode
   * @param barcode - The scanned barcode
   * @returns Promise<FoodItem | null>
   */
  async lookupProduct(barcode: string): Promise<FoodItem | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const product = this.productDatabase.get(barcode);
      
      if (!product) {
        // Return a generic product for unknown barcodes
        return {
          name: `Unknown Product (${barcode})`,
          estimatedCalories: 100,
          context: 'Scanned Product',
          quantity: 1,
          unit: 'item',
          description: 'Product scanned from barcode - please verify details',
          brand: {
            name: 'Unknown Brand',
            icon: '📦',
            color: '#6B7280'
          }
        };
      }

      // Convert to FoodItem format
      return {
        name: product.name,
        estimatedCalories: product.calories || 100,
        context: product.brand || 'Scanned Product',
        quantity: 1,
        unit: product.servingSize || 'serving',
        description: product.description || `${product.name} from barcode scan`,
        brand: product.brand ? {
          name: product.brand,
          icon: this.getBrandIcon(product.brand),
          color: this.getBrandColor(product.brand)
        } : undefined
      };
    } catch (error) {
      console.error('Barcode lookup error:', error);
      return null;
    }
  }

  /**
   * Get brand icon based on brand name
   */
  private getBrandIcon(brand: string): string {
    const brandIcons: { [key: string]: string } = {
      'Cadbury': '🍫',
      'Coca-Cola': '🥤',
      'Walkers': '🥔',
      'Heinz': '🥫',
      'McVitie\'s': '🍪',
      'Tesco': '🛒',
      'Ben & Jerry\'s': '🍦',
      'Red Bull': '⚡',
      'Quaker': '🌾',
      'Nestle': '🍫'
    };
    return brandIcons[brand] || '📦';
  }

  /**
   * Get brand color based on brand name
   */
  private getBrandColor(brand: string): string {
    const brandColors: { [key: string]: string } = {
      'Cadbury': '#7F3C8D',
      'Coca-Cola': '#F40009',
      'Walkers': '#FF6B35',
      'Heinz': '#E31837',
      'McVitie\'s': '#8B4513',
      'Tesco': '#00532F',
      'Ben & Jerry\'s': '#FF69B4',
      'Red Bull': '#FF0000',
      'Quaker': '#8B4513',
      'Nestle': '#8B4513'
    };
    return brandColors[brand] || '#6B7280';
  }

  /**
   * Validate barcode format (basic validation)
   */
  isValidBarcode(barcode: string): boolean {
    // Basic validation for common barcode formats
    const cleaned = barcode.replace(/\D/g, '');
    return cleaned.length >= 8 && cleaned.length <= 14;
  }
}

export const barcodeService = new BarcodeService();
