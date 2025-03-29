import { LogoStyle } from '~/types/generation';

export const LOGO_STYLES: { id: LogoStyle; label: string; image: any }[] = [
  { id: 'none', label: 'No Style', image: require('~/assets/logo-styles/no-style.png') },
  { id: 'monogram', label: 'Monogram', image: require('~/assets/logo-styles/monogram.png') },
  { id: 'abstract', label: 'Abstract', image: require('~/assets/logo-styles/abstract.png') },
  { id: 'mascot', label: 'Mascot', image: require('~/assets/logo-styles/mascoot.png') },
];

export const DEFAULT_PROMPT = "A blue lion logo reading 'HEXA' in bold letters";

export const MAX_PROMPT_LENGTH = 500;

// Gradient colors as readonly tuples for LinearGradient
export const GRADIENT_COLORS = {
  primary: ['#943DFF', '#2938DC'] as readonly string[],
};

// BlurView settings
export const BLUR_INTENSITY = 90;
