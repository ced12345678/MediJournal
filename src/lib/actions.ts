'use server';

import { z } from 'zod';

// AI-related imports are commented out or removed
// import { analyzeFamilyHistoryForRiskFactors, familyHistoryChat } from '@/ai/flows/analyze-family-history-for-risk-factors';
// import type { AnalyzeFamilyHistoryOutput, FamilyHistoryChatOutput } from '@/ai/flows/analyze-family-history-for-risk-factors';
// import { generateHealthTips } from '@/ai/flows/generate-health-tips';
// import type { GenerateHealthTipsOutput } from '@/ai/flows/generate-health-tips';

const analysisSchema = z.object({
  familyHistory: z.string().min(50),
});

const chatSchema = z.object({
  history: z.string(),
  question: z.string().min(1),
});

const GenerateHealthTipsInputSchema = z.object({
    location: z.string(),
    age: z.number(),
});

// Type definitions remain for structure, but functions are removed
type AnalyzeFamilyHistoryOutput = any;
type FamilyHistoryChatOutput = any;
type GenerateHealthTipsOutput = any;


type AnalysisFormState = {
  data: AnalyzeFamilyHistoryOutput | null;
  error: string | null;
};

type ChatFormState = {
    data: FamilyHistoryChatOutput | null;
    error: string | null;
}

type HealthTipsFormState = {
    data: GenerateHealthTipsOutput | null;
    error: string | null;
}

export async function analyzeFamilyHistoryAction(
  values: z.infer<typeof analysisSchema>
): Promise<AnalysisFormState> {
    return {
        data: null,
        error: "This feature has been disabled to prevent costs."
    }
}

export async function familyHistoryChatAction(
    values: z.infer<typeof chatSchema>
): Promise<ChatFormState> {
    return {
        data: null,
        error: "This feature has been disabled to prevent costs."
    }
}

export async function generateHealthTipsAction(
    values: z.infer<typeof GenerateHealthTipsInputSchema>
): Promise<HealthTipsFormState> {
     return {
        data: null,
        error: "This feature has been disabled to prevent costs."
    }
}
