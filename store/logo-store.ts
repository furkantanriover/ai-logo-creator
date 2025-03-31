import { create } from "zustand";
import { Generation, LogoStyle } from "~/types/generation";

export interface LogoState {
  // Current generation data
  currentGeneration: {
    status: "idle" | "processing" | "done" | "error";
    logoUrl?: string;
    prompt?: string;
    style?: LogoStyle;
    projectId?: string;
  };

  // Latest successful generation
  latestProject: Generation | null;

  // Actions
  setCurrentGeneration: (generation: {
    status: "idle" | "processing" | "done" | "error";
    logoUrl?: string;
    prompt?: string;
    style?: LogoStyle;
    projectId?: string;
  }) => void;

  setLatestProject: (project: Generation | null) => void;

  // Reset current generation to idle state
  resetCurrentGeneration: () => void;
}

export const useLogoStore = create<LogoState>((set) => ({
  currentGeneration: {
    status: "idle",
  },
  latestProject: null,

  setCurrentGeneration: (generation) =>
    set(() => ({
      currentGeneration: generation,
    })),

  setLatestProject: (project) =>
    set(() => ({
      latestProject: project,
    })),

  resetCurrentGeneration: () =>
    set(() => ({
      currentGeneration: {
        status: "idle",
      },
    })),
}));
