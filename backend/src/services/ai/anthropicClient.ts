import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';

let anthropicClientInstance: Anthropic | null = null;

export const getAnthropicClient = (): Anthropic | null => {
  if (!env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY.trim() === '') {
    return null;
  }

  if (!anthropicClientInstance) {
    anthropicClientInstance = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  return anthropicClientInstance;
};
