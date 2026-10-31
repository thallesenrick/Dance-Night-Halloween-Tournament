import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
 plugins:[tailwindcss()],
 optimizeDeps:{include:['three','@mediapipe/tasks-vision']},
 server:{watch:{ignored:['**/.npm-cache/**']}}
});
