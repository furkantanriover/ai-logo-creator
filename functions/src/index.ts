import { GoogleGenerativeAI } from "@google/generative-ai";
import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import OpenAI from "openai";

if (!admin.apps.length) {
  admin.initializeApp();
}

const apiKey = defineSecret("GEMINI_API_KEY");
const openaiApiKey = defineSecret("OPENAI_API_KEY");
const db = admin.firestore();

export const generateLogoPrompt = onCall(
  {
    enforceAppCheck: false,
    maxInstances: 5,
  },
  async (request) => {
    try {
      const { style } = request.data;
      const genAI = new GoogleGenerativeAI(apiKey.value());
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      let stylePrompt = "";
      switch (style) {
        case "monogram":
          stylePrompt =
            "Create a monogram-style logo prompt that uses initials or letters in an elegant, intertwined design.";
          break;
        case "abstract":
          stylePrompt =
            "Create an abstract logo prompt that uses geometric shapes, lines, and modern design elements.";
          break;
        case "mascot":
          stylePrompt =
            "Create a mascot-style logo prompt that features a friendly, memorable character or animal.";
          break;
        default:
          stylePrompt =
            "Create a versatile logo prompt that works well in any style.";
      }

      const prompt =
        `${stylePrompt} ` +
        "Make it specific, visual, and brand-friendly. " +
        "Respond with just the prompt text, no explanations.";

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
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

// Add new callable function for direct client use
export const generateLogo = onCall(
  {
    enforceAppCheck: false,
    maxInstances: 5,
  },
  async (request) => {
    const { prompt, style, userId } = request.data;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticatedddd",
      };
    }

    try {
      // Create a new generation document
      const generationRef = db
        .collection("users")
        .doc(userId)
        .collection("generations")
        .doc();

      // Save initial generation info
      await generationRef.set({
        prompt,
        style,
        status: "processing",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

      let styleInstruction = "";
      switch (style) {
        case "monogram":
          styleInstruction =
            "Create a monogram-style logo with elegant, intertwined letters.";
          break;
        case "abstract":
          styleInstruction =
            "Create an abstract logo with geometric shapes and modern design elements.";
          break;
        case "mascot":
          styleInstruction =
            "Create a mascot-style logo with a friendly, memorable character or animal.";
          break;
        default:
          styleInstruction = "Create a clean, professional logo.";
      }

      // Generate image with DALL-E 3
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${prompt}. ${styleInstruction} Make it a professional logo with a clean background.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      });

      const imageUrl = response.data[0]?.url;

      if (!imageUrl) {
        throw new Error("No image URL returned from OpenAI");
      }

      // Update the generation document with the result
      await generationRef.update({
        status: "done",
        imageUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        imageUrl,
      };
    } catch (error) {
      console.error("Error generating logo:", error);
      return {
        success: false,
        error: (error as Error).message || "Failed to generate logo",
      };
    }
  }
);

// Keep existing Firestore trigger function but rename it
export const processLogoGeneration = onDocumentCreated(
  "users/{userId}/generations/{generationId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const data = snapshot.data();
    const userId = event.params.userId;
    const generationId = event.params.generationId;

    if (data.status !== "processing") {
      console.log(`Skipping document with status: ${data.status}`);
      return;
    }

    try {
      console.log(
        `Generating logo for user ${userId}, generation ${generationId}`
      );

      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

      let styleInstruction = "";
      switch (data.style) {
        case "monogram":
          styleInstruction =
            "Create a monogram-style logo with elegant, intertwined letters.";
          break;
        case "abstract":
          styleInstruction =
            "Create an abstract logo with geometric shapes and modern design elements.";
          break;
        case "mascot":
          styleInstruction =
            "Create a mascot-style logo with a friendly, memorable character or animal.";
          break;
        default:
          styleInstruction = "Create a clean, professional logo.";
      }

      // Generate image with DALL-E 3
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${data.prompt}. ${styleInstruction} Make it a professional logo with a clean background.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      });

      const imageUrl = response.data[0]?.url;

      if (!imageUrl) {
        throw new Error("No image URL returned from OpenAI");
      }

      await db
        .collection("users")
        .doc(userId)
        .collection("generations")
        .doc(generationId)
        .update({
          status: "done",
          imageUrl,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`Successfully generated logo for ${generationId}`);
    } catch (error) {
      console.error("Error generating logo:", error);

      await db
        .collection("users")
        .doc(userId)
        .collection("generations")
        .doc(generationId)
        .update({
          status: "error",
          error: (error as Error).message || "Failed to generate logo",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
  }
);
