// src/index.ts

import type { App, Plugin } from 'vue';
import AtempoCal from './components/AtempoCal.vue';
import type { CalendarEvent, Resource, CalendarView, TimeFormat } from './types';

const AtempoCalPlugin: Plugin = {
    install(app: App) {
        app.component('AtempoCal', AtempoCal);
    }
};

export {
    AtempoCal,
    AtempoCalPlugin
};

export type {
    CalendarEvent,
    Resource,
    CalendarView,
    TimeFormat
};
