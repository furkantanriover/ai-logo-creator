import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';

import { useAuthContext } from '~/context/AuthContext';
import { GeneratePromptResponse } from '~/types/generation';
import { functions } from '~/utils/firebase';

export function useGeneratePrompt() {
  const generatePromptFn = httpsCallable<void, GeneratePromptResponse>(
    functions,
    'generateLogoPrompt'
  );
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await generatePromptFn();
      if (!result.data.success || !result.data.prompt) {
        throw new Error(result.data.error || 'Failed to generate prompt');
      }
      return result.data.prompt;
    },
    onError: (error) => {
      console.error('Error in generatePrompt mutation:', error);
    },
  });
}
