# Nu Food Logger API

An AI-powered food logging backend API that processes voice recordings to extract food items and estimate calories using OpenAI's Whisper and GPT-4o models.

## Features

- 🎤 Voice-to-text transcription using OpenAI Whisper API
- 🧠 AI-powered food parsing and calorie estimation using GPT-4o
- 📊 Structured JSON response with meal categorization
- 🔒 Secure file upload handling with validation
- 🛡️ Comprehensive error handling and validation
- 📝 TypeScript support with full type safety

## API Endpoint

### POST `/api/log/voice`

Processes an audio file containing food logging information and returns structured nutrition data.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Audio file (field name: `audio`)
- Supported formats: MP3, WAV, M4A, OGG

**Response:**
```json
{
  "meal": "Lunch",
  "items": [
    {
      "name": "Cheese and Pickle Sandwich",
      "estimatedCalories": 450,
      "context": null
    },
    {
      "name": "Packet of Crisps",
      "estimatedCalories": 150,
      "context": null
    },
    {
      "name": "Chocolate Bar",
      "estimatedCalories": 230,
      "context": null
    },
    {
      "name": "Flat White",
      "estimatedCalories": 120,
      "context": "from Pret"
    }
  ],
  "totalEstimatedCalories": 950
}
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /Users/matt/Desktop/Nu-food-logger
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

### Development

- **Development server with watch mode:**
  ```bash
  npm run dev:watch
  ```

- **Build TypeScript:**
  ```bash
  npm run build
  ```

## Configuration

Environment variables in `.env`:

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MAX_FILE_SIZE`: Maximum audio file size in bytes (default: 10MB)
- `ALLOWED_AUDIO_TYPES`: Comma-separated list of allowed MIME types

## Usage Example

```bash
# Test the API with curl
curl -X POST http://localhost:3000/api/log/voice \
  -F "audio=@path/to/your/audio/file.mp3"
```

## Error Handling

The API returns structured error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

Common error scenarios:
- Missing audio file (400)
- Invalid file type (400)
- File too large (400)
- Transcription failure (422)
- Nutrition parsing failure (422)
- OpenAI API errors (500)

## Architecture

```
src/
├── server.ts              # Express server setup and routes
├── services/
│   └── openaiService.ts   # OpenAI API integration
└── types/
    └── index.ts           # TypeScript interfaces
```

## Health Check

Check server status:
```bash
curl http://localhost:3000/health
```

## License

MIT

