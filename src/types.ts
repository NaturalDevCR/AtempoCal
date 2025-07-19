import type {Atemporal} from "atemporal";

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