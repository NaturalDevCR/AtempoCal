import type {Atemporal} from "atemporal";

// --- ENUMS ---
export type CalendarView = 'week' | 'day';

// --- INTERFACES ---
export interface Resource {
    id: string | number;
    name: string;
}

export interface CalendarEvent {
    id: string | number;
    resourceId: string | number;
    date: string | Date; // Aceptamos ISO string o un objeto Date
    title: string;
    description?: string;
    type?: string; // Para clases CSS personalizadas
    color?: string; // Para estilos dinámicos
    startTime?: string; // Para vista de día (formato HH:mm)
    endTime?: string; // Para vista de día (formato HH:mm)
}

export interface DayView {
    atemporal: Atemporal;
    isoDate: string;
    isToday: boolean;
    formatted: {
        dayName: string;
        dayAndMonth: string;
    };
}

export interface TimeSlot {
    hour: number;
    formatted: string; // "08:00", "09:00", etc.
}