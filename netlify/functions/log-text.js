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
    const { text } = JSON.parse(event.body);
    
    if (!text || typeof text !== 'string' || !text.trim()) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'No text provided',
          message: 'Please provide text describing the food you ate'
        }),
      };
    }

    // Simple text parsing for demo
    const items = [];
    
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
    
    if (text.toLowerCase().includes('burger')) {
      items.push({
        name: "Burger",
        estimatedCalories: 500,
        context: "from text input",
        quantity: 1,
        unit: "serving",
        description: "Burger from text input"
      });
    }
    
    if (text.toLowerCase().includes('salad')) {
      items.push({
        name: "Salad",
        estimatedCalories: 100,
        context: "from text input",
        quantity: 1,
        unit: "serving",
        description: "Salad from text input"
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

    const response = {
      meal: "General",
      items: items,
      totalEstimatedCalories: items.reduce((sum, item) => sum + item.estimatedCalories, 0)
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Error processing text log:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to process text input'
      }),
    };
  }
};
