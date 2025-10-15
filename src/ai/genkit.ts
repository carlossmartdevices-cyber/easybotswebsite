import { genkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with Google AI
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
});

export default ai;
