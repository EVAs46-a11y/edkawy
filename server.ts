import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { createApiApp } from './server/app.js';
import { parseCliPort } from './server/config/env.js';

process.on('uncaughtException', (err) => {
  console.error('[Edkawy Server] Uncaught exception guarded:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Edkawy Server] Unhandled rejection guarded:', reason);
});

async function startServer() {
  const port = parseCliPort();
  const app = createApiApp();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(import.meta.dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Edkawy server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
