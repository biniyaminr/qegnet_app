import './style.css';
import { createApp } from './ui/app.js';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); window.kinitInstallPrompt = event; });

createApp(document.getElementById('app'));
