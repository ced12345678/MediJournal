
'use client';

import React, { useMemo } from 'react';
import { Syringe, Pill, Stethoscope, HeartPulse, Biohazard, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { AddEventForm } from './add-event-form';
import { TimelineEvent, EventType, eventIcons } from './health-sync-app';


const TimelineItem = ({ event, isLast }: { event: TimelineEvent; isLast: boolean }) => {
  const Icon = eventIcons[event.type] || HelpCircle;
  return (
    <div className="relative pl-12 py-3 group animate-in fade-in-50 duration-500">
      {!isLast && <div className="absolute left-5 top-0 h-full w-0.5 bg-border -translate-x-1/2" />}
      
      <div className="absolute left-5 top-4 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary border-2 border-primary/30 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="ml-4">
        <div className="flex items-center gap-2">
            <p className="font-semibold text-md text-foreground">{event.title}</p>
            {event.details?.visitType && <Badge variant={event.details.visitType === 'Serious Visit' ? 'destructive' : 'secondary'}>{event.details.visitType}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
        <p className="text-sm text-foreground/80 mt-1">{event.description}</p>
        
        {event.type === 'Doctor Visit' && event.details?.visitType === 'Serious Visit' && (
             <div className="mt-2 text-sm space-y-1">
                {event.details.diseaseName && <p><span className="font-semibold text-foreground">Diagnosis:</span> {event.details.diseaseName}</p>}
                {event.details.medicationsPrescribed && <p><span className="font-semibold text-foreground">Prescription:</span> {event.details.medicationsPrescribed}</p>}
            </div>
        )}
        
        <div className="flex items-center gap-2 mt-1">
             <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{event.type}</div>
             {event.details?.status && <Badge variant={event.details?.status === 'Active' ? 'default' : 'secondary'} className={event.details?.status === 'Active' ? 'bg-accent text-accent-foreground' : ''}>{event.details.status}</Badge>}
        </div>
      </div>
    </div>
  );
};


export default function TimelineView({ events, onAddEvent }: { events: TimelineEvent[], onAddEvent: (event: Omit<TimelineEvent, 'id'> | Omit<TimelineEvent, 'id'>[]) => void }) {
  
  const eventsByAge = useMemo(() => {
    const grouped: { [age: number]: TimelineEvent[] } = {};
    events.forEach(event => {
      if (!grouped[event.age]) {
        grouped[event.age] = [];
      }
      grouped[event.age].push(event);
    });
    // Sort events within each age group chronologically
    for (const age in grouped) {
      grouped[age].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return grouped;
  }, [events]);

  const sortedAges = useMemo(() => {
      return Object.keys(eventsByAge).map(Number).sort((a, b) => b - a);
  }, [eventsByAge]);


  return (
    <div className="relative">
        <div className="max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Your Life Story</h2>
                 <AddEventForm onAddEvent={onAddEvent}>
                    <Button>Add Event</Button>
                </AddEventForm>
            </div>
            
            {sortedAges.length > 0 ? (
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full" defaultValue={`age-${sortedAges[0]}`}>
                            {sortedAges.map(age => {
                                const ageEvents = eventsByAge[age];
                                if (!ageEvents || ageEvents.length === 0) {
                                    return null;
                                }
                                const eventSummary = ageEvents.map(e => e.type).slice(0, 3).join(', ') + (ageEvents.length > 3 ? '...' : '');
                                return (
                                    <AccordionItem value={`age-${age}`} key={age} className="px-6 border-b last:border-b-0">
                                        <AccordionTrigger className="text-xl font-bold hover:no-underline py-6">
                                            <div className="flex justify-between w-full items-center pr-4">
                                                <span>Age {age}</span>
                                                <span className="text-sm font-normal text-muted-foreground">{eventSummary}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="relative pt-2">
                                                {ageEvents.map((event, index) => (
                                                    <TimelineItem key={event.id} event={event} isLast={index === ageEvents.length - 1} />
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-24 bg-card">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">No Events Yet</h3>
                        <p className="text-sm text-muted-foreground">Click the "Add Event" button to add your first health event.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
