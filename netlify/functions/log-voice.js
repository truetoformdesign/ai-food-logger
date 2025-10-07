const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse the multipart form data
    const contentType = event.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
      };
    }

    // For Netlify Functions, we need to handle the file differently
    // This is a simplified version - in production you'd want to use a proper multipart parser
    const body = event.body;
    
    // Mock response for demo purposes
    const mockResponse = {
      meal: "Lunch",
      items: [
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
      ],
      totalEstimatedCalories: 305
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockResponse),
    };

  } catch (error) {
    console.error('Error processing voice log:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to process voice recording'
      }),
    };
  }
};
