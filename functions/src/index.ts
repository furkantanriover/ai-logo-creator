import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

if (!admin.apps.length) {
  admin.initializeApp();
}

const apiKey = defineSecret("GEMINI_API_KEY");

export const generateLogoPrompt = onCall(
  {
    enforceAppCheck: false,
    maxInstances: 5,
  },
  async () => {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.value());
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt =
        "Generate a creative, short prompt idea for an AI logo. " +
        "Make it specific, visual, and brand-friendly. " +
        "Respond with just the prompt text, no explanations.";

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      console.log("generated", text);
      return {
        success: true,
        prompt: text,
      };
    } catch (error) {
      console.error("Error generating logo prompt:", error);
      return {
        success: false,
        error: "Failed to generate a creative prompt. Please try again.",
      };
    }
  }
);
