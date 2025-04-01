# AI Logo Creator

AI Logo Creator is a mobile application that leverages artificial intelligence to generate custom logos based on user prompts and selected styles. Users can create beautiful logos in seconds using OpenAI's DALL-E 3 image generation capabilities and Google's Gemini AI for prompt enhancements.

<p align="center">
  <img src="./assets/app-logo.jpg" alt="AI Logo Creator" width="500"/>
</p>

## Features

- **AI-Powered Logo Generation**: Create professional logos using DALL-E 3
- **Multiple Style Options**: Choose from different logo styles (Monogram, Abstract, Mascot, or None)
- **Smart Prompt Suggestions**: Get AI-generated prompt ideas from Google Gemini
- **Project History**: View and manage previously generated logos
- **Logo Download**: Save logos to your device gallery
- **Cross-Platform**: Works on iOS and Android

## Tech Stack

### Mobile App

- **React Native & Expo**: Core app framework
- **TypeScript**: Type-safe JavaScript
- **NativeWind**: Tailwind CSS for React Native
- **Expo Router**: File-based routing
- **React Query**: Data fetching and caching
- **Zustand**: State management
- **Firebase Auth**: User authentication
- **React Hook Form**: Form handling

### Backend (Firebase)

- **Firebase Cloud Functions**: Serverless backend
- **Firestore**: Database for storing user projects
- **OpenAI API**: DALL-E 3 for image generation
- **Google Gemini API**: AI text generation

## Project Structure

```
ai-logo-creator/
├── app/                   # Expo Router screens & navigation
├── assets/                # Images, fonts, etc.
├── components/            # Reusable UI components
├── constants/             # App constants and configuration
├── context/               # React context providers
├── functions/             # Firebase Cloud Functions
├── hooks/                 # Custom React hooks
├── providers/             # Provider components
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Expo CLI
- Firebase Account
- OpenAI API Key
- Google Gemini API Key

### Mobile App Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/furkantanriover/ai-logo-creator.git
   cd ai-logo-creator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase and API configuration:

   ```
   # Firebase
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id

   # Other Configuration
   EXPO_PUBLIC_API_URL=your_api_url
   ```

4. Run the development server:

   ```bash
   npm run start
   ```

5. Open the app on your device using Expo Go or run on a simulator:
   ```bash
   npm run ios
   # or
   npm run android
   ```

### Firebase Functions Setup

See the [functions/README.md](./functions/README.md) for detailed setup instructions for the Firebase Cloud Functions.

## Core Workflows

### Logo Generation Process

1. User enters a prompt describing their logo idea
2. User selects a logo style (Monogram, Abstract, Mascot, or None)
3. The app sends the request to Firebase Functions
4. Firebase Functions call OpenAI's DALL-E 3 to generate the logo
5. The generated logo is stored in Firestore and returned to the app
6. User can view, download, or manage their logo

### State Management

The app uses Zustand to manage application state, particularly for tracking the current logo generation process and latest projects. The main store includes:

- Current generation status (idle, processing, done, error)
- Latest project information
- User authentication state

## Key Components

- **ProjectStatusIndicator**: Shows the current generation status
- **LogoStylesSection**: Displays available logo style options
- **PromptInputSection**: Text input for the logo prompt with "Surprise Me" feature
- **PreviousProjectsSection**: Horizontal scrolling list of past generated logos

## License

This project is private and proprietary. All rights reserved.

## Acknowledgements

- [OpenAI](https://openai.com/) for DALL-E 3
- [Google](https://ai.google.dev/) for Gemini AI
- [Expo](https://expo.dev/) for the React Native framework
- [Firebase](https://firebase.google.com/) for backend services
