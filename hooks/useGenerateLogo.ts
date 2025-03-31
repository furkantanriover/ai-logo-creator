import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { httpsCallable } from "firebase/functions";

import { useAuthContext } from "~/context/AuthContext";
import { LogoFormValues } from "~/types/generation";
import { functions } from "~/utils/firebase";
import { useProjectStore } from "~/store/projectStore";

export function useGenerateLogo() {
  const generateLogoFn = httpsCallable<
    LogoFormValues,
    { success: boolean; imageUrl?: string; error?: string }
  >(functions, "generateLogo");
  const { user } = useAuthContext();
  const addProject = useProjectStore((state) => state.addProject);

  return useMutation({
    mutationFn: async ({ prompt, style, userId }: LogoFormValues) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const result = await generateLogoFn({ prompt, style, userId });
      if (!result.data.success || !result.data.imageUrl) {
        throw new Error(result.data.error || "Failed to generate logo");
      }

      // Create a unique ID for this generation
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create a project object
      const project = {
        id,
        prompt,
        style,
        status: "done" as const,
        imageUrl: result.data.imageUrl,
        createdAt: new Date(),
      };

      // Add to project store
      addProject(project);

      // Return the image URL along with the prompt and style
      return {
        imageUrl: result.data.imageUrl,
        prompt,
        style,
      };
    },
    onError: (error) => {
      console.error("Error in generateLogo mutation:", error);
    },
  });
}
