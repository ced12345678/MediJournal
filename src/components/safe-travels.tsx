
"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateHealthTipsAction } from '@/lib/actions';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Siren, Shield, Heart, Map } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn, getNamespacedKey } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';


const TipSchema = z.object({
    category: z.string().describe("The category of the health tip (e.g., 'Vaccination', 'Diet', 'Exercise', 'Local Alert')."),
    title: z.string().describe("A short, catchy title for the health tip."),
    description: z.string().describe("A detailed description of the health tip, providing actionable advice."),
    severity: z.enum(['low', 'medium', 'high']).describe("The urgency or importance of the tip."),
});

const GenerateHealthTipsOutputSchema = z.object({
    tips: z.array(TipSchema).describe("An array of personalized health tips."),
});

export type GenerateHealthTipsOutput = z.infer<typeof GenerateHealthTipsOutputSchema>;

type HealthTipsState = {
  data: GenerateHealthTipsOutput | null;
  error: string | null;
  isLoading: boolean;
};

const categoryIcons = {
    'Vaccination': <Shield className="h-5 w-5" />,
    'Diet': <Heart className="h-5 w-5" />,
    'Exercise': <Heart className="h-5 w-5" />,
    'Local Alert': <Siren className="h-5 w-5" />,
    'General Wellness': <Sparkles className="h-5 w-5" />,
    'Default': <Sparkles className="h-5 w-5" />,
}

const severityColors = {
    low: 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-300',
    medium: 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800/50 dark:text-yellow-300',
    high: 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-300',
}

export default function SafeTravels() {
  const { user } = useAuth();
  const [age, setAge] = useState(30); // Default age
  const [location, setLocation] = useState('');
  const [state, setState] = useState<HealthTipsState>({ data: null, error: null, isLoading: false });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user) {
        const storedAge = localStorage.getItem(getNamespacedKey('age', user.id));
        if (storedAge) {
            setAge(parseInt(storedAge, 10));
        }
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setState({ data: null, error: null, isLoading: true });

    startTransition(async () => {
      const result = await generateHealthTipsAction({ location: location, age: age });
      setState({ data: result.data, error: result.error, isLoading: false });
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SafeTravels</CardTitle>
          <CardDescription>Enter your destination to get AI-powered travel health recommendations based on your age.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, USA"
              className="flex-1"
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !location.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Map className="mr-2 h-4 w-4" />
                  Get Travel Tips
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {state.isLoading && (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {state.error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.data.tips.map((tip, index) => {
            const Icon = categoryIcons[tip.category as keyof typeof categoryIcons] || categoryIcons['Default'];
            const severityClass = severityColors[tip.severity];

            return (
              <Card key={index} className={cn("flex flex-col", severityClass)}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{Icon}</div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </div>
                   <Badge variant="outline" className="w-fit mt-2">{tip.category}</Badge>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm">{tip.description}</p>
                </CardContent>
              </Card>
            )
        })}
        </div>
      )}
    </div>
  );
}

