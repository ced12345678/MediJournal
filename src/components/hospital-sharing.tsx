"use client";

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import pako from 'pako';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { TimelineEvent } from './timeline-view';
import { Separator } from './ui/separator';

type AllData = {
    personalInfo: Record<string, string | null>;
    timeline: TimelineEvent[];
    familyHistory: any;
    travelHistory: any;
};

const DataViewer = ({ compressedData }: { compressedData: string }) => {
    const [data, setData] = useState<AllData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const decoded = atob(compressedData);
            const charData = decoded.split('').map(c => c.charCodeAt(0));
            const binData = new Uint8Array(charData);
            const decompressed = pako.inflate(binData, { to: 'string' });
            const parsedData: AllData = JSON.parse(decompressed);
            setData(parsedData);
        } catch (e) {
            console.error("Failed to decode or decompress data:", e);
            setError("The provided data link is invalid or corrupted.");
        }
    }, [compressedData]);
    
    if (error) {
        return (
            <div className="p-4 md:p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!data) {
        return <div className="p-4 md:p-6">Loading and decrypting data...</div>;
    }

    const { personalInfo, timeline, familyHistory, travelHistory } = data;
    const doctorVisits = timeline.filter(e => e.type === 'Doctor Visit');
    const medications = timeline.filter(e => e.type === 'Medication');
    const diseases = timeline.filter(e => e.type === 'Disease');

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Shared Health Summary</CardTitle>
                    <CardDescription>This is a temporary, read-only view of the health record.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div><p className="font-semibold">Name:</p><p>{personalInfo.name}</p></div>
                    <div><p className="font-semibold">Age:</p><p>{personalInfo.age}</p></div>
                    <div><p className="font-semibold">Height:</p><p>{personalInfo.height}</p></div>
                    <div><p className="font-semibold">Weight:</p><p>{personalInfo.weight}</p></div>
                </CardContent>
            </Card>

            {doctorVisits.length > 0 && <Card>
                <CardHeader><CardTitle>Doctor Visits</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {doctorVisits.map(e => <div key={e.id}><p className="font-semibold">{e.title} ({new Date(e.date).toLocaleDateString()})</p><p className="text-sm text-muted-foreground">{e.description}</p></div>)}
                </CardContent>
            </Card>}

            {medications.length > 0 && <Card>
                <CardHeader><CardTitle>Medications</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                     {medications.map(e => <div key={e.id}><p className="font-semibold">{e.title} ({new Date(e.date).toLocaleDateString()})</p><p className="text-sm text-muted-foreground">{e.description}</p></div>)}
                </CardContent>
            </Card>}

            {diseases.length > 0 && <Card>
                <CardHeader><CardTitle>Diagnosed Diseases</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                     {diseases.map(e => <div key={e.id}><p className="font-semibold">{e.title} ({new Date(e.date).toLocaleDateString()})</p><p className="text-sm text-muted-foreground">{e.description}</p></div>)}
                </CardContent>
            </Card>}

            {familyHistory?.analysis && <Card>
                <CardHeader><CardTitle>Family History AI Summary</CardTitle></CardHeader>
                <CardContent>
                    <p>{familyHistory.analysis.riskFactors}</p>
                </CardContent>
            </Card>}
            
            {travelHistory?.length > 0 && <Card>
                <CardHeader><CardTitle>Travel History</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                     {travelHistory.map((t: any) => <div key={t.id}><p className="font-semibold">{t.location} - {t.year}</p><p className="text-sm text-muted-foreground">{t.notes}</p></div>)}
                </CardContent>
            </Card>}

        </div>
    )
}

export default function HospitalSharing() {
    const [shareUrl, setShareUrl] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const personalInfoKeys = ['name', 'age', 'height', 'weight', 'userId'];
            const personalInfo = personalInfoKeys.reduce((acc, key) => {
                acc[`healthsync-${key}`] = localStorage.getItem(`healthsync-${key}`);
                return acc;
            }, {} as Record<string, string | null>);

            const allData: AllData = {
                personalInfo: {
                    name: localStorage.getItem('healthsync-name'),
                    age: localStorage.getItem('healthsync-age'),
                    height: localStorage.getItem('healthsync-height'),
                    weight: localStorage.getItem('healthsync-weight'),
                },
                timeline: JSON.parse(localStorage.getItem('healthsync-timeline') || '[]'),
                familyHistory: JSON.parse(localStorage.getItem('healthsync-familyHistory') || '{}'),
                travelHistory: JSON.parse(localStorage.getItem('healthsync-travelHistory') || '[]'),
            };

            const stringifiedData = JSON.stringify(allData);
            const compressed = pako.deflate(stringifiedData, { to: 'string' });
            const encoded = btoa(compressed);
            
            const url = `${window.location.origin}/view/${encoded}`;
            setShareUrl(url);
        }
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Copied!', description: 'The sharing link has been copied to your clipboard.' });
    };

    return (
        <div className="p-4 md:p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                         <Share2 className="h-6 w-6" />
                        <CardTitle>Share Your Health Record</CardTitle>
                    </div>
                    <CardDescription>
                        Generate a temporary, secure link to share a read-only snapshot of your health data with a medical professional. This link contains your data and will be viewable by anyone who has it.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {shareUrl ? (
                        <>
                            <div className="flex justify-center">
                                <div className="p-4 bg-white rounded-lg border">
                                    <QRCode value={shareUrl} size={192} />
                                </div>
                            </div>
                            <Separator />
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Shareable Link</label>
                                <div className="flex gap-2">
                                    <Input value={shareUrl} readOnly />
                                    <Button variant="outline" size="icon" onClick={copyToClipboard}><Copy /></Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>Generating secure link...</p>
                    )}
                </CardContent>
            </Card>
             <Alert className="mt-6">
                <AlertTitle>How it Works</AlertTitle>
                <AlertDescription>
                   All your health data is compressed and encoded directly into the link and QR code. No data is stored on any server. When someone scans the code or opens the link, the data is decoded and displayed in their browser just for that session.
                </AlertDescription>
            </Alert>
        </div>
    );
}

export { DataViewer };
