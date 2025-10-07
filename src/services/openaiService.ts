import OpenAI from 'openai';
import { TranscriptionResult, VoiceLogResponse, MulterFile } from '../types';
import { InsightsService } from './insightsService';

export class OpenAIService {
  private client: OpenAI;
  private insightsService: InsightsService;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
    this.insightsService = new InsightsService(apiKey);
  }

  /**
   * Transcribe audio file using OpenAI Whisper API
   * @param audioFile - The audio file buffer
   * @param filename - The original filename
   * @returns Promise<TranscriptionResult>
   */
  async transcribeAudio(audioFile: Buffer, filename: string): Promise<TranscriptionResult> {
    try {
      // Create a File-like object for the OpenAI API
      const file = new File([audioFile], filename, { type: 'audio/mpeg' });
      
      const transcription = await this.client.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'en', // You can make this configurable
        response_format: 'verbose_json',
      });

      return {
        text: transcription.text,
        language: transcription.language,
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio file');
    }
  }

  /**
   * Parse transcribed text and estimate nutrition using GPT-4o
   * @param transcribedText - The text from Whisper transcription
   * @returns Promise<VoiceLogResponse>
   */
  async parseAndEstimateNutrition(transcribedText: string): Promise<VoiceLogResponse> {
    try {
      const systemPrompt = `You are an expert nutritional assistant. Your task is to parse a user's transcribed speech about the food they ate and convert it into a structured JSON object.

Instructions:
1. Identify the mealtime mentioned (e.g., 'lunch', 'breakfast', 'dinner', 'snack'). If none is mentioned, set the meal to 'General'.
2. List every distinct food and drink item.
3. For each item, extract the quantity and unit if mentioned (e.g., "6 pints", "2 slices", "1 cup", "500ml").
4. For each item, provide a reasonable calorie estimate PER UNIT, then multiply by the quantity.
5. If the user mentions a specific brand or restaurant (e.g., 'from Pret', 'Cadbury'), use that information to make your calorie estimate more accurate. Capture this brand/source in a 'context' field.
6. Create a clear description that includes the quantity and unit.

IMPORTANT CALORIE CALCULATION RULES:
- 1 cup of coffee = 5 calories
- 1 pint of lager = 180 calories  
- 1 slice of pizza = 200 calories
- 1 sandwich = 300 calories
- 1 cup of tea = 2 calories
- 1 banana = 100 calories
- 1 apple = 80 calories
- 1 serving of lasagna = 400 calories
- 1 slice of cheesecake = 300 calories
- 1 cup of salad = 20 calories

MULTIPLY the per-unit calories by the quantity mentioned.

CRITICAL: Your response must be ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Return only the JSON object.

The JSON structure should be:
{
  "meal": "string",
  "items": [
    {
      "name": "string",
      "estimatedCalories": number,
      "context": "string | null",
      "quantity": number,
      "unit": "string",
      "description": "string"
    }
  ],
  "totalEstimatedCalories": number
}`;

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Please parse this food log: "${transcribedText}"`,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 1000,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from GPT-4o');
      }

      // Clean the response text to extract JSON from markdown code blocks
      let cleanedResponse = responseText.trim();
      
      // Remove markdown code block syntax if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (!parsedResponse.meal || !parsedResponse.items || !Array.isArray(parsedResponse.items)) {
        throw new Error('Invalid response structure from GPT-4o');
      }

      // Calculate total calories
      const totalCalories = parsedResponse.items.reduce((sum: number, item: any) => sum + item.estimatedCalories, 0);

      // Generate item-specific health insights
      const itemsWithInsights = await this.insightsService.generateItemInsights(parsedResponse.items);

      return {
        meal: parsedResponse.meal,
        items: itemsWithInsights,
        totalEstimatedCalories: totalCalories,
      } as VoiceLogResponse;
    } catch (error) {
      console.error('Error parsing nutrition data:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse nutrition data - invalid JSON response');
      }
      throw new Error('Failed to estimate nutrition from transcribed text');
    }
  }
}
