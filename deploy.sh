#!/bin/bash

# AI Food Logger - Deployment Script
echo "🚀 Deploying AI Food Logger to Netlify..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📥 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=build

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "📱 Your app is now live on Netlify!"
else
    echo "❌ Deployment failed"
    exit 1
fi
