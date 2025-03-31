import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { useEffect } from "react";

import { useAuthContext } from "~/context/AuthContext";
import { useLogoStore } from "~/store/logo-store";
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
  const { setLatestProject } = useLogoStore();

  const result = useQuery({
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

  // Update the latest project in the store whenever projects data changes
  useEffect(() => {
    if (result.data && result.data.length > 0) {
      setLatestProject(result.data[0]);
    }
  }, [result.data, setLatestProject]);

  return result;
}
