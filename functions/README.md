# AI Logo Creator - Firebase Functions

This directory contains the Firebase Cloud Functions for the AI Logo Creator app. These serverless functions handle AI-powered logo generation, user project management, and interact with external AI services like Google Gemini and OpenAI.

## Tech Stack

- **Firebase Cloud Functions**: Serverless backend
- **Firestore**: Database for storing user projects and generation data
- **Google Gemini**: AI service for creative prompt generation
- **OpenAI DALL-E 3**: AI image generation service for logo creation
- **TypeScript**: Type-safe JavaScript for better code quality

## Setup Instructions

1. Install the Firebase CLI globally:

   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:

   ```
   firebase login
   ```

3. Install dependencies:

   ```
   cd functions
   npm install
   ```

4. Configure the required API keys as Firebase secrets:
   ```
   firebase functions:secrets:set GEMINI_API_KEY
   firebase functions:secrets:set OPENAI_API_KEY
   ```

## Environment Variables

Create a `.env` file in the functions directory with the following:

```
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Development

1. Run the Firebase emulator for local testing:

   ```
   npm run serve
   ```

2. Build the TypeScript code:

   ```
   npm run build
   ```

3. Deploy the functions to Firebase:
   ```
   npm run deploy
   ```

## Functions Overview

### generateLogoPrompt

Generates creative logo descriptions using Google Gemini AI.

- **Type**: HTTPS Callable
- **Parameters**:
  ```typescript
  {
    style: "none" | "monogram" | "abstract" | "mascot";
  }
  ```
- **Returns**:
  ```typescript
  {
    success: boolean;
    prompt?: string;
    error?: string;
  }
  ```

### generateLogo

Creates a logo using OpenAI's DALL-E 3 based on the user's prompt and selected style.

- **Type**: HTTPS Callable
- **Parameters**:
  ```typescript
  {
    prompt: string;
    style: "none" | "monogram" | "abstract" | "mascot";
    userId: string;
  }
  ```
- **Returns**:
  ```typescript
  {
    success: boolean;
    imageUrl?: string;
    projectId?: string;
    error?: string;
  }
  ```

### processLogoGeneration

Background function that triggers when a new generation document is created, providing fail-safe logo generation.

- **Type**: Firestore Trigger (onDocumentCreated)
- **Trigger Path**: `users/{userId}/generations/{generationId}`

### getUserProjects

Retrieves a user's completed logo generation projects.

- **Type**: HTTPS Callable
- **Parameters**:
  ```typescript
  {
    userId: string;
  }
  ```
- **Returns**:
  ```typescript
  {
    success: boolean;
    projects?: Array<{
      id: string;
      prompt: string;
      style: string;
      status: string;
      imageUrl: string;
      createdAt: Date;
    }>;
    error?: string;
  }
  ```

### getUserProjectById

Retrieves a specific project by ID for a user.

- **Type**: HTTPS Callable
- **Parameters**:
  ```typescript
  {
    userId: string;
    projectId: string;
  }
  ```
- **Returns**:
  ```typescript
  {
    success: boolean;
    project?: {
      id: string;
      prompt: string;
      style: string;
      status: string;
      imageUrl: string;
      createdAt: Date;
    };
    error?: string;
  }
  ```

## Data Model

### Generation Document

```typescript
{
  prompt: string;
  style: "none" | "monogram" | "abstract" | "mascot";
  status: "processing" | "done" | "error";
  imageUrl?: string;
  error?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## License

This project is private and proprietary.
