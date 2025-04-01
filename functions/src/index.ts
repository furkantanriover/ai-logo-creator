import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
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
const storage = admin.storage();

/**
 * Downloads an image from a URL and returns it as a buffer
 */
async function downloadImageFromUrl(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data, "binary");
}

/**
 * Uploads an image to Firebase Storage and returns the public URL
 */
async function uploadImageToStorage(
  imageBuffer: Buffer,
  userId: string,
  generationId: string
): Promise<string> {
  const bucket = storage.bucket();
  const filePath = `logos/${userId}/${generationId}.png`;
  const file = bucket.file(filePath);

  await file.save(imageBuffer, {
    metadata: {
      contentType: "image/png",
    },
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
}

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
        error: "User not authenticated",
      };
    }

    try {
      const generationRef = db
        .collection("users")
        .doc(userId)
        .collection("generations")
        .doc();

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

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${prompt}. ${styleInstruction} Make it a professional logo with a clean background.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      });

      const tempImageUrl = response.data[0]?.url;

      if (!tempImageUrl) {
        throw new Error("No image URL returned from OpenAI");
      }

      // Download and save the image to Firebase Storage
      const imageBuffer = await downloadImageFromUrl(tempImageUrl);
      const storageImageUrl = await uploadImageToStorage(
        imageBuffer,
        userId,
        generationRef.id
      );

      await generationRef.update({
        status: "done",
        tempImageUrl, // Keep the original URL for reference
        imageUrl: storageImageUrl, // Use the permanent storage URL
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        imageUrl: storageImageUrl,
        projectId: generationRef.id,
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

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${data.prompt}. ${styleInstruction} Make it a professional logo with a clean background.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid",
      });

      const tempImageUrl = response.data[0]?.url;

      if (!tempImageUrl) {
        throw new Error("No image URL returned from OpenAI");
      }

      // Download and save the image to Firebase Storage
      const imageBuffer = await downloadImageFromUrl(tempImageUrl);
      const storageImageUrl = await uploadImageToStorage(
        imageBuffer,
        userId,
        generationId
      );

      await db
        .collection("users")
        .doc(userId)
        .collection("generations")
        .doc(generationId)
        .update({
          status: "done",
          tempImageUrl, // Keep the original URL for reference
          imageUrl: storageImageUrl, // Use the permanent storage URL
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

export const getUserProjects = onCall(
  {
    enforceAppCheck: false,
    maxInstances: 5,
  },
  async (request) => {
    const { userId } = request.data;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    try {
      const generationsRef = db
        .collection("users")
        .doc(userId)
        .collection("generations");

      const snapshot = await generationsRef
        .where("status", "==", "done")
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      return {
        success: true,
        projects,
      };
    } catch (error) {
      console.error("Error fetching user projects:", error);
      return {
        success: false,
        error: (error as Error).message || "Failed to fetch user projects",
      };
    }
  }
);

export const getUserProjectById = onCall(
  {
    enforceAppCheck: false,
    maxInstances: 5,
  },
  async (request) => {
    const { userId, projectId } = request.data;

    if (!userId || !projectId) {
      return {
        success: false,
        error: "User ID and project ID are required",
      };
    }

    try {
      const projectRef = db
        .collection("users")
        .doc(userId)
        .collection("generations")
        .doc(projectId);

      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        return {
          success: false,
          error: "Project not found",
        };
      }

      const projectData = {
        id: projectDoc.id,
        ...projectDoc.data(),
        createdAt: projectDoc.data()?.createdAt?.toDate() || new Date(),
      };

      return {
        success: true,
        project: projectData,
      };
    } catch (error) {
      console.error("Error fetching project by ID:", error);
      return {
        success: false,
        error: (error as Error).message || "Failed to fetch project",
      };
    }
  }
);
