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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeartPulse } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const success = login(username, password);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-card">
        <Card className="mx-auto max-w-sm w-full shadow-2xl">
            <CardHeader className="text-center space-y-4">
                 <div className="flex flex-col items-center justify-center gap-2 mb-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <HeartPulse className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">MediJournal</h1>
                </div>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                Enter your username to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                        id="username"
                        type="text"
                        placeholder="john1234"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                            <AlertTitle>Login Failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button type="submit" className="w-full mt-2">
                        Login
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline text-primary">
                    Sign up
                </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
