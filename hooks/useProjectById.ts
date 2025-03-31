import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { useEffect } from "react";

import { useAuthContext } from "~/context/AuthContext";
import { useLogoStore } from "~/store/logo-store";
import { Generation } from "~/types/generation";
import { functions } from "~/utils/firebase";

type ProjectResponse = {
  success: boolean;
  project?: Generation;
  error?: string;
};

export function useProjectById(projectId: string | undefined) {
  const { user } = useAuthContext();
  const { setCurrentGeneration } = useLogoStore();

  console.log("sss", projectId, user?.uid);
  const getUserProjectByIdFn = httpsCallable<
    { userId: string; projectId: string },
    ProjectResponse
  >(functions, "getUserProjectById");

  const result = useQuery({
    queryKey: ["projecst", user?.uid, projectId],
    queryFn: async () => {
      if (!user?.uid || !projectId) {
        throw new Error("User not authenticated or project ID is missing");
      }
      console.log("user.uiddsalkdlssakdl", user.uid);
      const result = await getUserProjectByIdFn({
        userId: user.uid,
        projectId,
      });
      if (!result.data.success) {
        throw new Error(result.data.error || "Failed to fetch project");
      }

      return result.data.project;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // When we successfully get a project by ID, update the current generation
  useEffect(() => {
    if (result.data && projectId) {
      setCurrentGeneration({
        status:
          result.data.status === "done"
            ? "done"
            : result.data.status === "error"
              ? "error"
              : "idle",
        logoUrl: result.data.imageUrl,
        prompt: result.data.prompt,
        style: result.data.style,
        projectId,
      });
    }
  }, [result.data, projectId, setCurrentGeneration]);

  return result;
}
