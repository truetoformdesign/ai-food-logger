# Nu Food Logger Frontend

A beautiful, modern React frontend for the AI-powered food logging application. Features voice input, real-time food logging, and a sleek mobile-first design.

## Features

- 🎤 **Voice Recording** - Record your meals with one tap
- 📱 **Mobile-First Design** - Optimized for mobile devices
- 🎨 **Modern UI** - Beautiful animations and smooth interactions
- ⚡ **Real-time Processing** - Instant food logging with AI
- 📊 **Calorie Tracking** - Automatic calorie estimation
- 🔄 **Live Updates** - Real-time UI updates

## Design

Based on the Figma wireframe, this interface features:
- Clean, minimalist design
- Intuitive voice recording interface
- Real-time food item display
- Smooth animations and transitions
- Mobile-optimized layout

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Axios** for API calls

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on port 3000

### Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3001
   ```

## Usage

### Voice Recording
1. Tap the microphone button
2. Speak your meal details
3. Tap again to stop recording
4. AI processes and logs your food

### Text Input
1. Tap the keyboard button
2. Type your meal details
3. Submit to process

### Viewing Logs
- See all logged food items
- View calorie estimates
- Remove items if needed

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api/log/voice` for:
- Voice transcription
- Food parsing
- Calorie estimation

## Styling

The app uses a custom color palette:
- Primary: Blue tones (#0ea5e9)
- Gray scale for text and backgrounds
- Red for recording states
- Green for success states

## Animations

- Smooth page transitions
- Recording pulse animation
- Item entry animations
- Loading states

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Project Structure

```
src/
├── components/
│   └── FoodLogInterface.tsx  # Main food logging component
├── types/
│   └── index.ts              # TypeScript interfaces
├── App.tsx                   # Main app component
├── index.tsx                 # App entry point
└── index.css                 # Global styles
```

## Production Build

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## License

MIT

