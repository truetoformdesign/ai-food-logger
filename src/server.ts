import express from 'express';
import multer from 'multer';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { OpenAIService } from './services/openaiService';
import { VoiceLogResponse, ApiError, MulterFile } from './types';
import { serverErrorLogger } from './utils/errorLogger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI service
const openaiService = new OpenAIService(process.env.OPENAI_API_KEY || '');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_AUDIO_TYPES || 'audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/aiff,audio/x-aiff').split(',');
    const allowedExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.aiff', '.aif'];
    
    // Check MIME type or file extension
    const hasValidMimeType = allowedTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    if (hasValidMimeType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const requestId = Math.random().toString(36).substring(2);
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      serverErrorLogger.log('warning', 'File too large', 'Multer', error.stack, requestId, ip, userAgent);
      return res.status(400).json({
        error: 'File too large',
        message: 'Audio file exceeds maximum size limit',
        statusCode: 400,
      } as ApiError);
    }
  }
  
  if (error.message === 'Invalid file type. Only audio files are allowed.') {
    serverErrorLogger.log('warning', 'Invalid file type', 'Multer', error.stack, requestId, ip, userAgent);
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message,
      statusCode: 400,
    } as ApiError);
  }

  serverErrorLogger.log('error', `Unhandled error: ${error.message}`, 'Server', error.stack, requestId, ip, userAgent);
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    statusCode: 500,
  } as ApiError);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Client error logging endpoint
app.post('/api/logs/client', express.json(), (req, res) => {
  try {
    const { logs, sessionId } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    if (logs && Array.isArray(logs)) {
      serverErrorLogger.logClientErrors(logs, sessionId, ip);
      res.json({ success: true, logged: logs.length });
    } else {
      res.status(400).json({ error: 'Invalid logs format' });
    }
  } catch (error) {
    serverErrorLogger.log('error', `Failed to process client logs: ${error}`, 'ClientLogs');
    res.status(500).json({ error: 'Failed to process logs' });
  }
});

// Error monitoring endpoint
app.get('/api/logs/errors', (req, res) => {
  try {
    const stats = serverErrorLogger.getErrorStats();
    const recentErrors = serverErrorLogger.getRecentErrors(60); // Last hour
    
    res.json({
      stats,
      recentErrors: recentErrors.slice(-50), // Last 50 errors
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    serverErrorLogger.log('error', `Failed to get error logs: ${error}`, 'ErrorMonitoring');
    res.status(500).json({ error: 'Failed to get error logs' });
  }
});

// Text logging endpoint
app.post('/api/log/text', express.json(), async (req, res) => {
  const requestId = Math.random().toString(36).substring(2);
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || !text.trim()) {
      serverErrorLogger.log('warning', 'No text provided', 'TextLog', undefined, requestId, ip, userAgent);
      return res.status(400).json({
        error: 'No text provided',
        message: 'Please provide text describing the food you ate',
        statusCode: 400,
      } as ApiError);
    }

    console.log(`Processing text input: ${text.substring(0, 100)}...`);
    serverErrorLogger.log('info', `Processing text input: ${text.substring(0, 100)}...`, 'TextLog', undefined, requestId, ip, userAgent);

    // Parse text and estimate nutrition using GPT-4o
    console.log('Parsing nutrition data...');
    const nutritionData = await openaiService.parseAndEstimateNutrition(text);
    
    console.log('Nutrition data parsed successfully');
    serverErrorLogger.log('info', `Nutrition parsing successful: ${nutritionData.items.length} items logged`, 'TextLog', undefined, requestId, ip, userAgent);

    // Return the structured response
    res.json(nutritionData as VoiceLogResponse);

  } catch (error) {
    console.error('Error processing text log:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred while processing the text';
    
    if (error instanceof Error) {
      if (error.message.includes('parse') || error.message.includes('nutrition')) {
        statusCode = 422;
        errorMessage = 'Failed to parse food information from the text.';
        serverErrorLogger.log('error', `Nutrition parsing failed: ${error.message}`, 'TextLog', error.stack, requestId, ip, userAgent);
      } else if (error.message.includes('API key') || error.message.includes('authentication')) {
        statusCode = 500;
        errorMessage = 'Service configuration error. Please contact support.';
        serverErrorLogger.log('error', `API authentication failed: ${error.message}`, 'TextLog', error.stack, requestId, ip, userAgent);
      } else {
        serverErrorLogger.log('error', `Text logging error: ${error.message}`, 'TextLog', error.stack, requestId, ip, userAgent);
      }
    }

    res.status(statusCode).json({
      error: 'Processing failed',
      message: errorMessage,
      statusCode,
    } as ApiError);
  }
});

// Main voice logging endpoint
app.post('/api/log/voice', upload.single('audio'), async (req, res) => {
  const requestId = Math.random().toString(36).substring(2);
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  try {
    // Validate request
    if (!req.file) {
      serverErrorLogger.log('warning', 'No audio file provided', 'VoiceLog', undefined, requestId, ip, userAgent);
      return res.status(400).json({
        error: 'No audio file provided',
        message: 'Please provide an audio file in the request',
        statusCode: 400,
      } as ApiError);
    }

    const audioFile = req.file as MulterFile;
    console.log(`Processing audio file: ${audioFile.originalname}, size: ${audioFile.size} bytes`);
    serverErrorLogger.log('info', `Processing audio file: ${audioFile.originalname}, size: ${audioFile.size} bytes`, 'VoiceLog', undefined, requestId, ip, userAgent);

    // Step 1: Transcribe audio to text using Whisper API
    console.log('Transcribing audio...');
    const transcriptionResult = await openaiService.transcribeAudio(
      audioFile.buffer,
      audioFile.originalname
    );
    
    console.log('Transcription result:', transcriptionResult.text);
    serverErrorLogger.log('info', `Transcription successful: ${transcriptionResult.text.substring(0, 100)}...`, 'VoiceLog', undefined, requestId, ip, userAgent);

    // Step 2: Parse text and estimate nutrition using GPT-4o
    console.log('Parsing nutrition data...');
    const nutritionData = await openaiService.parseAndEstimateNutrition(transcriptionResult.text);
    
    console.log('Nutrition data parsed successfully');
    serverErrorLogger.log('info', `Nutrition parsing successful: ${nutritionData.items.length} items logged`, 'VoiceLog', undefined, requestId, ip, userAgent);

    // Return the structured response
    res.json(nutritionData as VoiceLogResponse);

  } catch (error) {
    console.error('Error processing voice log:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred while processing the audio file';
    
    if (error instanceof Error) {
      if (error.message.includes('transcribe')) {
        statusCode = 422;
        errorMessage = 'Failed to transcribe audio file. Please ensure the audio is clear and in a supported format.';
        serverErrorLogger.log('error', `Transcription failed: ${error.message}`, 'VoiceLog', error.stack, requestId, ip, userAgent);
      } else if (error.message.includes('parse') || error.message.includes('nutrition')) {
        statusCode = 422;
        errorMessage = 'Failed to parse food information from the transcribed text.';
        serverErrorLogger.log('error', `Nutrition parsing failed: ${error.message}`, 'VoiceLog', error.stack, requestId, ip, userAgent);
      } else if (error.message.includes('API key') || error.message.includes('authentication')) {
        statusCode = 500;
        errorMessage = 'Service configuration error. Please contact support.';
        serverErrorLogger.log('error', `API authentication failed: ${error.message}`, 'VoiceLog', error.stack, requestId, ip, userAgent);
      } else {
        serverErrorLogger.log('error', `Voice logging error: ${error.message}`, 'VoiceLog', error.stack, requestId, ip, userAgent);
      }
    }

    res.status(statusCode).json({
      error: 'Processing failed',
      message: errorMessage,
      statusCode,
    } as ApiError);
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    statusCode: 404,
  } as ApiError);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nu Food Logger API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎤 Voice logging: POST http://localhost:${PORT}/api/log/voice`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY not set. Please configure your OpenAI API key.');
  }
});

export default app;
