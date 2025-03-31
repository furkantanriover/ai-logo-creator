import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";

import { useAuthContext } from "~/context/AuthContext";
import { Generation } from "~/types/generation";
import { functions } from "~/utils/firebase";

type ProjectsResponse = {
  success: boolean;
  projects?: Generation[];
  error?: string;
};

export function useProjects() {
  const { user } = useAuthContext();
  const getUserProjectsFn = httpsCallable<{ userId: string }, ProjectsResponse>(
    functions,
    "getUserProjects"
  );

  return useQuery({
    queryKey: ["projects", user?.uid],
    queryFn: async () => {
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      const result = await getUserProjectsFn({ userId: user.uid });
      console.log("result", result);

      if (!result.data.success) {
        throw new Error(result.data.error || "Failed to fetch projects");
      }

      return result.data.projects || [];
    },
    enabled: !!user?.uid,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
}
