import OpenAI from 'openai';
import { FoodItem, HealthInsight } from '../types';
import { BrandService } from './brandService';

export class InsightsService {
  private client: OpenAI;
  private brandService: BrandService;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
    this.brandService = new BrandService();
  }

  /**
   * Generate health insights for individual food items
   * @param items - Array of food items
   * @returns Promise<FoodItem[]> with insights attached
   */
  async generateItemInsights(items: FoodItem[]): Promise<FoodItem[]> {
    const itemsWithInsights = await Promise.all(
      items.map(async (item) => {
        const insights = await this.generateItemSpecificInsights(item);
        const brand = this.brandService.detectBrand(item.context);
        return { ...item, insights, brand: brand || undefined };
      })
    );
    return itemsWithInsights;
  }

  /**
   * Generate health insights for a specific food item
   * @param item - Single food item
   * @returns Promise<HealthInsight[]>
   */
  private async generateItemSpecificInsights(item: FoodItem): Promise<HealthInsight[]> {
    try {
      const systemPrompt = `You are a health and nutrition expert. Analyze individual food items and provide specific insights.

Guidelines:
1. Focus on the specific item (e.g., "6 pints of lager", "pizza", "coffee")
2. Provide item-specific advice
3. Keep insights brief and actionable
4. Use appropriate icons (🍺, ⚠️, 💡, 🎯, 🥗, 🏃, etc.)
5. Return insights as JSON array

Return format:
[
  {
    "type": "warning" | "info" | "positive",
    "title": "Brief title",
    "message": "Helpful message",
    "icon": "emoji"
  }
]

Examples:
- "6 pints of lager" → High alcohol warning
- "pizza" → Processed food info
- "coffee" → Caffeine info
- "vegetables" → Positive nutrition`;

      const itemDescription = `${item.name} (${item.quantity || 1} ${item.unit || 'serving'}) - ${item.estimatedCalories} calories`;

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Analyze this food item: ${itemDescription}\n\nProvide specific health insights for this item.`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        return [];
      }

      // Clean the response text to extract JSON from markdown code blocks
      let cleanedResponse = responseText.trim();
      
      // Remove markdown code block syntax if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Additional cleaning for common JSON issues
      cleanedResponse = cleanedResponse
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Parse the JSON response with better error handling
      let insights;
      try {
        insights = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('JSON parse error in insights:', parseError);
        console.error('Cleaned response:', cleanedResponse);
        return [];
      }
      
      // Validate the response structure
      if (!Array.isArray(insights)) {
        return [];
      }

      return insights.filter(insight => 
        insight.type && insight.title && insight.message && insight.icon
      );

    } catch (error) {
      console.error('Error generating item insights:', error);
      return [];
    }
  }

  /**
   * Generate health insights based on food items (legacy method)
   * @param items - Array of food items
   * @param totalCalories - Total calories consumed
   * @returns Promise<HealthInsight[]>
   */
  async generateInsights(items: FoodItem[], totalCalories: number): Promise<HealthInsight[]> {
    try {
      const systemPrompt = `You are a health and nutrition expert. Analyze the food items and provide helpful insights.

Guidelines:
1. Focus on concerning patterns (excessive alcohol, high calories, unhealthy foods)
2. Provide constructive, non-judgmental advice
3. Keep insights brief and actionable
4. Use appropriate icons (🍺, ⚠️, 💡, 🎯, 🥗, 🏃, etc.)
5. Return insights as JSON array

Return format:
[
  {
    "type": "warning" | "info" | "positive",
    "title": "Brief title",
    "message": "Helpful message",
    "icon": "emoji"
  }
]

Examples of insights to provide:
- High alcohol consumption (6+ drinks)
- Very high calorie intake (3000+ calories)
- Lack of vegetables/fruits
- Excessive processed foods
- Positive choices (vegetables, water, etc.)
- Meal timing concerns`;

      const foodSummary = items.map(item => 
        `${item.name} (${item.quantity || 1} ${item.unit || 'serving'}) - ${item.estimatedCalories} cal`
      ).join(', ');

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Food items: ${foodSummary}\nTotal calories: ${totalCalories}\n\nProvide health insights for this meal.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        return [];
      }

      // Clean the response text to extract JSON from markdown code blocks
      let cleanedResponse = responseText.trim();
      
      // Remove markdown code block syntax if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Additional cleaning for common JSON issues
      cleanedResponse = cleanedResponse
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Parse the JSON response with better error handling
      let insights;
      try {
        insights = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('JSON parse error in insights:', parseError);
        console.error('Cleaned response:', cleanedResponse);
        return [];
      }
      
      // Validate the response structure
      if (!Array.isArray(insights)) {
        return [];
      }

      return insights.filter(insight => 
        insight.type && insight.title && insight.message && insight.icon
      );

    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }
}

