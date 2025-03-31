import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";

import { useAuthContext } from "~/context/AuthContext";
import { Generation } from "~/types/generation";
import { functions } from "~/utils/firebase";

type ProjectResponse = {
  success: boolean;
  project?: Generation;
  error?: string;
};

export function useProjectById(projectId: string | undefined) {
  const { user } = useAuthContext();
  console.log("sss", projectId, user?.uid);
  const getUserProjectByIdFn = httpsCallable<
    { userId: string; projectId: string },
    ProjectResponse
  >(functions, "getUserProjectById");

  return useQuery({
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
}
