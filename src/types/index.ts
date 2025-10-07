// TypeScript interfaces for the food logging API

export interface FoodItem {
  name: string;
  estimatedCalories: number;
  context: string | null;
  quantity?: number;
  unit?: string;
  description?: string;
  insights?: HealthInsight[];
  brand?: {
    name: string;
    icon: string;
    color: string;
  };
}

export interface VoiceLogResponse {
  meal: string;
  items: FoodItem[];
  totalEstimatedCalories: number;
  insights?: HealthInsight[];
}

export interface HealthInsight {
  type: 'warning' | 'info' | 'positive';
  title: string;
  message: string;
  icon: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
