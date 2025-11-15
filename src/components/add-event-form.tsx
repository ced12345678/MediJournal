
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getNamespacedKey } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ScrollArea } from './ui/scroll-area';
import { type TimelineEvent, type EventType, eventTypes } from './timeline-view';

export const AddEventForm = ({
  onAddEvent,
  defaultEventType,
  hideAgeInput = false,
  children,
}: {
  onAddEvent: (event: Omit<TimelineEvent, 'id'> | Omit<TimelineEvent, 'id'>[]) => void,
  defaultEventType?: EventType,
  hideAgeInput?: boolean,
  children: React.ReactNode
}) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [age, setAge] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<EventType>(defaultEventType || 'Other');
    const [open, setOpen] = useState(false);
    
    const [visitType, setVisitType] = useState<'Casual Visit' | 'Serious Visit' | undefined>();
    const [diseaseName, setDiseaseName] = useState('');
    const [medicationsPrescribed, setMedicationsPrescribed] = useState('');
    
    const [medicationForDisease, setMedicationForDisease] = useState('');

     useEffect(() => {
        if (open) {
            if (defaultEventType) {
                setType(defaultEventType);
            }
            if (user) {
                const storedAge = localStorage.getItem(getNamespacedKey('age', user.id)) || '';
                setAge(storedAge);
            }
        }
    }, [open, defaultEventType, user]);
    
    useEffect(() => {
        if (type !== 'Doctor Visit') {
            setVisitType(undefined);
            setDiseaseName('');
            setMedicationsPrescribed('');
        }
        if (type !== 'Disease') {
            setMedicationForDisease('');
        }
    }, [type]);

    const resetForm = () => {
        setTitle('');
        setDate('');
        setAge('');
        setDescription('');
        setType(defaultEventType || 'Other');
        setVisitType(undefined);
        setDiseaseName('');
        setMedicationsPrescribed('');
        setMedicationForDisease('');
        setOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !type || !age) return;
        
        let eventDetails: TimelineEvent['details'] = {};
        if (type === 'Doctor Visit') {
            const newEvents: Omit<TimelineEvent, 'id'>[] = [];
            let visitDescription = description;
            
            const visitEvent: Omit<TimelineEvent, 'id'> = {
                title,
                date,
                description: visitDescription,
                type: 'Doctor Visit',
                age: parseInt(age),
                details: {
                    visitType: visitType,
                    diseaseName: visitType === 'Serious Visit' ? diseaseName : undefined,
                    medicationsPrescribed: visitType === 'Serious Visit' ? medicationsPrescribed : undefined,
                }
            };
            newEvents.push(visitEvent);

            if (visitType === 'Serious Visit' && diseaseName) {
                newEvents.push({
                    title: diseaseName,
                    date: date,
                    description: `Diagnosed during a visit for: ${title}.`,
                    type: 'Disease',
                    age: parseInt(age),
                });
            }
             if (visitType === 'Serious Visit' && medicationsPrescribed) {
                newEvents.push({
                    title: medicationsPrescribed,
                    date: date,
                    description: `Prescribed for ${diseaseName || title}`,
                    type: 'Medication',
                    age: parseInt(age),
                    details: { status: 'Stopped' }
                });
            }

            onAddEvent(newEvents);
        } else if (type === 'Disease' && medicationForDisease) {
            const diseaseEvent: Omit<TimelineEvent, 'id'> = {
                title,
                date,
                description: `${description}`,
                type: 'Disease',
                age: parseInt(age),
            };
            const medicationEvent: Omit<TimelineEvent, 'id'> = {
                title: medicationForDisease,
                date,
                description: `Prescribed for ${title}`,
                type: 'Medication',
                age: parseInt(age),
                details: { status: 'Stopped' }
            };
             onAddEvent([diseaseEvent, medicationEvent]);
        }
        else {
            onAddEvent({ title, date, description, type, age: parseInt(age), details: eventDetails });
        }

        resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                 <DialogHeader>
                    <DialogTitle>Add New Timeline Event</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh] pr-6">
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title / Reason</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            </div>
                            {!hideAgeInput && (
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                                </div>
                            )}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="type">Event Type</Label>
                            <Select onValueChange={(value) => setType(value as EventType)} value={type}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an event type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {eventTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {type === 'Doctor Visit' && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label>Visit Type</Label>
                                    <RadioGroup value={visitType} onValueChange={(v) => setVisitType(v as 'Casual Visit' | 'Serious Visit')} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Casual Visit" id="casual" />
                                            <Label htmlFor="casual">Casual Visit</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Serious Visit" id="serious" />
                                            <Label htmlFor="serious">Serious Visit</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                 {visitType === 'Serious Visit' && (
                                    <div className="space-y-4 pl-2 pt-4 border-l ml-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="diseaseName">Diagnosis / Disease Name (optional)</Label>
                                            <Input id="diseaseName" value={diseaseName} onChange={(e) => setDiseaseName(e.target.value)} placeholder="e.g., Influenza" />
                                             <p className="text-xs text-muted-foreground">This will also create a new entry in the "Diseases" section.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="medicationsPrescribed">Medications Prescribed (optional)</Label>
                                            <Input id="medicationsPrescribed" value={medicationsPrescribed} onChange={(e) => setMedicationsPrescribed(e.target.value)} placeholder="e.g., Tamiflu" />
                                            <p className="text-xs text-muted-foreground">This will also create a new entry in the "Medication" section.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                         {type === 'Disease' && (
                            <div className="space-y-4 pt-4 border-t">
                                 <div className="space-y-2">
                                    <Label htmlFor="medicationForDisease">Medication Prescribed (optional)</Label>
                                    <Input id="medicationForDisease" value={medicationForDisease} onChange={(e) => setMedicationForDisease(e.target.value)} placeholder="e.g., Amoxicillin" />
                                    <p className="text-xs text-muted-foreground">If entered, this will also create an entry in the "Medication" section.</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="description">Description / Notes</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                               <Button type="button" variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Add Event</Button>
                        </DialogFooter>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
