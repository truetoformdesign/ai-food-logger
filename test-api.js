/**
 * Simple test script for the Nu Food Logger API
 * Run this after starting the server to test the voice logging endpoint
 */

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testHealthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testVoiceLogging(audioFilePath) {
  if (!fs.existsSync(audioFilePath)) {
    console.error(`❌ Audio file not found: ${audioFilePath}`);
    console.log('💡 Please provide a valid audio file path as an argument');
    console.log('   Example: node test-api.js /path/to/audio.mp3');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFilePath));

    console.log(`🎤 Testing voice logging with: ${audioFilePath}`);
    const response = await fetch(`${API_BASE_URL}/api/log/voice`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Voice logging successful!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Voice logging failed:', data);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

async function main() {
  console.log('🧪 Testing Nu Food Logger API...\n');

  // Test health check
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run dev');
    return;
  }

  // Test voice logging if audio file provided
  const audioFilePath = process.argv[2];
  if (audioFilePath) {
    await testVoiceLogging(audioFilePath);
  } else {
    console.log('💡 To test voice logging, provide an audio file path:');
    console.log('   node test-api.js /path/to/audio.mp3');
  }
}

main().catch(console.error);

