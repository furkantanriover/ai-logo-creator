import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prompt, style, userId }: LogoFormValues) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

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

      setCurrentGeneration({
        status: "done",
        logoUrl: result.data.imageUrl,
        prompt,
        style,
        projectId: result.data.projectId,
      });

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
    onSuccess: () => {
      // Invalidate projects query to refetch the latest projects
      queryClient.invalidateQueries({ queryKey: ["projects", user?.uid] });
    },
  });
}
