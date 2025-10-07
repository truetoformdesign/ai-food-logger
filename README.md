# 🍎 AI Food Logger

A full-stack AI-powered food logging application with voice recognition, intelligent nutrition analysis, and real-time health insights.

![AI Food Logger](https://img.shields.io/badge/AI-Powered-green) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7)

## ✨ Features

### 🎤 **Voice Recording**
- Record your meals with voice commands
- OpenAI Whisper transcription
- Support for multiple audio formats

### ✍️ **Text Input**
- Type your food descriptions
- Same AI analysis as voice input
- Quick and convenient logging

### 🧠 **AI-Powered Analysis**
- GPT-4o nutrition analysis
- Accurate calorie estimation
- Quantity-aware calculations (5 cups = 25 cal, 3 pints = 540 cal)

### 🏷️ **Brand Detection**
- Automatic brand recognition (Starbucks ☕, Pret 🥐, McDonald's 🍟)
- Color-coded brand badges
- Context-aware calorie estimates

### 📊 **Health Insights**
- Inline health warnings and tips
- Real-time nutrition feedback
- Personalized recommendations

### 📱 **Modern UI**
- Mobile-first responsive design
- Framer Motion animations
- Clean, intuitive interface

### 🔍 **Error Monitoring**
- Real-time error tracking
- Comprehensive logging
- Debug dashboard

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key
- Git

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/ai-food-logger.git
cd ai-food-logger
npm install
cd frontend && npm install
```

### 2. Environment Setup
```bash
# Backend
cp env.example .env
# Add your OPENAI_API_KEY to .env

# Frontend (optional - for production)
cd frontend
echo "REACT_APP_API_URL=http://localhost:3000" > .env
```

### 3. Run Development
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

### 4. Open Your App
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **TypeScript** - Type safety
- **OpenAI API** - Whisper + GPT-4o
- **Multer** - File upload handling
- **CORS** + **Helmet** - Security

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications

### AI Services
- **OpenAI Whisper** - Speech-to-text
- **GPT-4o** - Nutrition analysis
- **Custom Brand Detection** - Shop recognition

## 📁 Project Structure

```
ai-food-logger/
├── src/                    # Backend API
│   ├── services/          # AI services
│   ├── utils/             # Utilities
│   └── types/             # TypeScript types
├── frontend/              # React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── utils/         # Client utilities
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── netlify.toml           # Netlify config
├── Procfile              # Heroku config
└── DEPLOYMENT.md         # Deployment guide
```

## 🚀 Deployment

### Option 1: Netlify (Frontend) + Heroku (Backend)

1. **Deploy Backend to Heroku**:
   ```bash
   heroku create your-food-logger-api
   heroku config:set OPENAI_API_KEY=your_key
   git subtree push --prefix=. heroku main
   ```

2. **Deploy Frontend to Netlify**:
   - Connect GitHub repo to Netlify
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`
   - Set `REACT_APP_API_URL` environment variable

### Option 2: Automated Deployment
```bash
./deploy.sh
```

## 📊 API Endpoints

### Voice Logging
```bash
POST /api/log/voice
Content-Type: multipart/form-data
Body: audio file
```

### Text Logging
```bash
POST /api/log/text
Content-Type: application/json
Body: {"text": "I had a pizza and coffee"}
```

### Health Check
```bash
GET /health
```

### Error Monitoring
```bash
GET /api/logs/errors
```

## 🎯 Usage Examples

### Voice Input
1. Click microphone button
2. Say: "I had a pret cheese sandwich and a flat white from Starbucks"
3. Get instant nutrition analysis with brand icons

### Text Input
1. Click text input button
2. Type: "5 cups of coffee and 3 pints of lager"
3. Get accurate calorie calculations (25 + 540 = 565 cal)

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
OPENAI_API_KEY=your_openai_key
PORT=3000
MAX_FILE_SIZE=10485760
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/ogg
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Test API
curl -X POST http://localhost:3000/api/log/text \
  -H "Content-Type: application/json" \
  -d '{"text": "I had a pizza and coffee"}'

# Test health
curl http://localhost:3000/health
```

## 📈 Performance

- **Voice Processing**: ~3-5 seconds
- **Text Processing**: ~1-2 seconds
- **AI Analysis**: ~2-3 seconds
- **Total Response**: ~5-10 seconds

## 🔒 Security

- Environment variables for API keys
- CORS configuration
- File type validation
- Input sanitization
- Error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check the [Deployment Guide](DEPLOYMENT.md)
- Review error logs in the app
- Open an issue on GitHub

## 🎉 Acknowledgments

- OpenAI for Whisper and GPT-4o APIs
- React and Tailwind CSS communities
- Netlify and Heroku for hosting

---

**Built with ❤️ using AI, React, and modern web technologies**