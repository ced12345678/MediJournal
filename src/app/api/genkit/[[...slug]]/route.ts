/**
 * @fileoverview This file is the entrypoint for Genkit's Next.js API routes.
 */

import { genkitNextApi } from '@genkit-ai/next';
import '@/ai/flows/generate-health-tips';

export const { GET, POST } = genkitNextApi();
