import { useMutation } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";

import { useAuthContext } from "~/context/AuthContext";
import { useLogoStore } from "~/store/logo-store";
import { LogoFormValues } from "~/types/generation";
import { functions } from "~/utils/firebase";

export function useGenerateLogo() {
  const generateLogoFn = httpsCallable<
    LogoFormValues,
    { success: boolean; imageUrl?: string; error?: string; projectId?: string }
  >(functions, "generateLogo");
  const { user } = useAuthContext();
  const { setCurrentGeneration } = useLogoStore();

  return useMutation({
    mutationFn: async ({ prompt, style, userId }: LogoFormValues) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Set generation status to processing
      setCurrentGeneration({
        status: "processing",
        prompt,
        style,
      });

      const result = await generateLogoFn({ prompt, style, userId });
      if (!result.data.success || !result.data.imageUrl) {
        setCurrentGeneration({
          status: "error",
          prompt,
          style,
        });
        throw new Error(result.data.error || "Failed to generate logo");
      }

      // Set generation status to done with the image URL
      setCurrentGeneration({
        status: "done",
        logoUrl: result.data.imageUrl,
        prompt,
        style,
        projectId: result.data.projectId,
      });

      // Return the image URL along with the prompt and style
      return {
        imageUrl: result.data.imageUrl,
        prompt,
        style,
        projectId: result.data.projectId,
      };
    },
    onError: (error) => {
      console.error("Error in generateLogo mutation:", error);
      setCurrentGeneration({
        status: "error",
      });
    },
  });
}
