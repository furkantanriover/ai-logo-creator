export type LogoStyle = 'none' | 'monogram' | 'abstract' | 'mascot';
export type GenerationStatus = 'processing' | 'done' | 'error';

export interface Generation {
  id?: string;
  prompt: string;
  style: LogoStyle;
  status: GenerationStatus;
  imageUrl?: string;
  createdAt?: Date;
}

// Form values type for React Hook Form
export type LogoFormValues = {
  prompt: string;
  style: LogoStyle;
};
