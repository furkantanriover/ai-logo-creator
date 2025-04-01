import * as Clipboard from "expo-clipboard";

/**
 * Copy text to clipboard and trigger a callback when done
 * @param text - Text to copy
 * @param onCopied - Optional callback to run after copying
 */
export const copyToClipboard = async (text: string, onCopied?: () => void): Promise<void> => {
  if (!text) return;

  try {
    await Clipboard.setStringAsync(text);
    if (onCopied) onCopied();
  } catch (error) {
    console.error("Error copying to clipboard:", error);
  }
};

/**
 * Copy text to clipboard with auto-reset of copied state
 * @param text - Text to copy
 * @param setCopied - State setter for copied state
 * @param resetTimeout - Time in ms before resetting copied state (default: 2000)
 */
export const copyWithReset = async (
  text: string,
  setCopied: (copied: boolean) => void,
  resetTimeout = 2000
): Promise<void> => {
  if (!text) return;

  try {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), resetTimeout);
  } catch (error) {
    console.error("Error copying to clipboard:", error);
  }
};
