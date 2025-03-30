# AI Logo Creator - Firebase Functions

This directory contains the Firebase Cloud Functions for the AI Logo Creator app.

## Setup Instructions

1. Install the Firebase CLI globally if you don't have it:

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

4. Configure the Gemini API key:
   ```
   firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
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

3. To deploy the functions to Firebase:
   ```
   npm run deploy
   ```

## Functions

### generateLogoPrompt

This function uses Google Gemini to generate creative prompts for AI logo generation.

- **Type**: HTTPS Callable
- **Parameters**: None
- **Returns**:
  ```typescript
  {
    success: boolean;
    prompt?: string;
    error?: string;
  }
  ```
