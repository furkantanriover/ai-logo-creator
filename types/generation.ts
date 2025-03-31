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
  control: any;
  onSurpriseMe: () => void;
  isGenerating: boolean;
}

export interface LogoStylesSectionProps {
  control: any;
  selectedStyle: LogoStyle;
}
