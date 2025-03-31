import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Generation } from "~/types/generation";

export interface ProjectState {
  projects: Generation[];
  activeProject: Generation | null;
  addProject: (project: Generation) => void;
  updateProject: (id: string, project: Partial<Generation>) => void;
  setActiveProject: (project: Generation | null) => void;
  getProjectById: (id: string) => Generation | undefined;
  hasProjects: () => boolean;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProject: null,

      addProject: (project: Generation) => {
        set((state) => ({
          projects: [project, ...state.projects],
          activeProject: project,
        }));
      },

      updateProject: (id: string, updatedProject: Partial<Generation>) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updatedProject } : project
          ),
          activeProject:
            state.activeProject?.id === id
              ? { ...state.activeProject, ...updatedProject }
              : state.activeProject,
        }));
      },

      setActiveProject: (project: Generation | null) => {
        set({ activeProject: project });
      },

      getProjectById: (id: string) => {
        return get().projects.find((project) => project.id === id);
      },

      hasProjects: () => {
        return get().projects.length > 0;
      },
    }),
    {
      name: "ai-logo-projects",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
