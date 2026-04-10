import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Mock for "Cloud Function" logic in preview
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: 'MHCAssist-Preview' });
  });

  // Background Task Simulation (Observation Deadline Check)
  setInterval(() => {
    console.log('[Background Task] Checking observation deadlines...');
    // In a real server, we would query Firestore here and send alerts
  }, 60000); // Check every minute in preview

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MHCAssist Server running on http://localhost:${PORT}`);
  });
}

startServer();
