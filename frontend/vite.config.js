// SI-ASSISTED: drafted by Claude (Anthropic); reviewed by the team.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node' },
});
