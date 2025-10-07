// Mock API service for demo purposes when backend is not available
import { FoodItem, VoiceLogResponse } from '../types';

export class MockApiService {
  /**
   * Mock voice transcription and food parsing
   */
  async processVoiceLog(audioBlob: Blob): Promise<VoiceLogResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock data based on common food items
    const mockItems: FoodItem[] = [
      {
        name: "Coffee",
        estimatedCalories: 5,
        context: "from voice recording",
        quantity: 1,
        unit: "cup",
        description: "Black coffee",
        brand: {
          name: "Generic",
          icon: "☕",
          color: "#8B4513"
        }
      },
      {
        name: "Sandwich",
        estimatedCalories: 300,
        context: "from voice recording",
        quantity: 1,
        unit: "serving",
        description: "Lunch sandwich",
        brand: {
          name: "Generic",
          icon: "🥪",
          color: "#6B7280"
        }
      }
    ];

    return {
      meal: "Lunch",
      items: mockItems,
      totalEstimatedCalories: mockItems.reduce((sum, item) => sum + item.estimatedCalories, 0)
    };
  }

  /**
   * Mock text processing
   */
  async processTextLog(text: string): Promise<VoiceLogResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple text parsing for demo
    const items: FoodItem[] = [];
    
    if (text.toLowerCase().includes('coffee')) {
      items.push({
        name: "Coffee",
        estimatedCalories: 5,
        context: "from text input",
        quantity: 1,
        unit: "cup",
        description: "Coffee from text input"
      });
    }
    
    if (text.toLowerCase().includes('sandwich') || text.toLowerCase().includes('lunch')) {
      items.push({
        name: "Sandwich",
        estimatedCalories: 300,
        context: "from text input",
        quantity: 1,
        unit: "serving",
        description: "Lunch from text input"
      });
    }
    
    if (text.toLowerCase().includes('pizza')) {
      items.push({
        name: "Pizza",
        estimatedCalories: 400,
        context: "from text input",
        quantity: 1,
        unit: "slice",
        description: "Pizza slice from text input"
      });
    }
    
    if (text.toLowerCase().includes('beer') || text.toLowerCase().includes('lager')) {
      items.push({
        name: "Beer",
        estimatedCalories: 150,
        context: "from text input",
        quantity: 1,
        unit: "pint",
        description: "Beer from text input"
      });
    }
    
    // If no specific items found, add a generic item
    if (items.length === 0) {
      items.push({
        name: "Food Item",
        estimatedCalories: 200,
        context: "from text input",
        quantity: 1,
        unit: "serving",
        description: `Parsed from: ${text.substring(0, 50)}...`
      });
    }

    return {
      meal: "General",
      items: items,
      totalEstimatedCalories: items.reduce((sum, item) => sum + item.estimatedCalories, 0)
    };
  }
}

export const mockApiService = new MockApiService();
