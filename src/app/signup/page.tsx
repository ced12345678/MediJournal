"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { user } = signup(name, password);
      setGeneratedUsername(user.username);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign-up.');
    }
  };

  if (generatedUsername) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/50">
            <Card className="mx-auto max-w-sm w-full">
                 <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <HeartPulse className="h-10 w-10 text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">HealthSync</h1>
                    </div>
                    <CardTitle className="text-2xl">Account Created!</CardTitle>
                    <CardDescription>
                        Your account has been successfully created.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p>Your auto-generated username is:</p>
                    <p className="font-mono text-lg bg-muted p-2 rounded-md">{generatedUsername}</p>
                    <p className="text-muted-foreground text-sm">Please save this username. You will need it to log in.</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => router.push('/login')} className="w-full">
                        Proceed to Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <HeartPulse className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">HealthSync</h1>
                </div>
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>
                Enter your information to create an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSignup} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="first-name">Name</Label>
                    <Input 
                        id="first-name" 
                        placeholder="John" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                </div>
                 {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Sign-up Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                <Button type="submit" className="w-full">
                    Create an account
                </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                    Login
                </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
