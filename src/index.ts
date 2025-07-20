import type { App, Plugin } from 'vue';
import AtempoCal from './components/AtempoCal.vue';

// Exportación para uso individual
export { AtempoCal };

// Creación del plugin para `app.use()`
const AtempoCalPlugin: Plugin = {
    install(app: App) {
        app.component('AtempoCal', AtempoCal);
    }
};

export default AtempoCalPlugin;
