import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Slack proxy — avoids browser CORS restrictions on direct webhook calls
app.post('/api/slack', async (req, res) => {
  const { webhookUrl, text } = req.body;
  if (!webhookUrl) return res.status(400).json({ error: 'Missing webhookUrl' });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    res.json({ ok: response.ok });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Serve the built React app
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — all routes return index.html so react-router works
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`John's Strength Builder running on port ${PORT}`);
});
