import { Control } from "react-hook-form";

export type LogoStyle = "none" | "monogram" | "abstract" | "mascot";
export type GenerationStatus = "processing" | "done" | "error";

export interface Generation {
  id?: string;
  prompt: string;
  style: LogoStyle;
  status: GenerationStatus;
  imageUrl?: string;
  createdAt?: Date;
}

export type LogoFormValues = {
  prompt: string;
  style: LogoStyle;
  userId: string;
};

export type GeneratePromptParams = {
  style: LogoStyle;
};

export type GeneratePromptResponse = {
  success: boolean;
  prompt?: string;
  error?: string;
};

// Component props types
export interface PromptInputSectionProps {
  control: Control<LogoFormValues>;
  onSurpriseMe: () => void;
  isGenerating: boolean;
}

export interface LogoStylesSectionProps {
  control: Control<LogoFormValues>;
  selectedStyle: LogoStyle;
}

export interface ProjectStatusIndicatorSectionProps {
  status?: GenerationStatus | undefined;
  logoUrl?: string;
  prompt?: string;
  style?: string;
  onTryAgain?: () => void;
}

export interface PreviousProjectsSectionProps {
  projects: Generation[];
  isLoading?: boolean;
  isGenerating?: boolean;
  status?: GenerationStatus | undefined;
  onProjectClick: (project: Generation) => void;
}
