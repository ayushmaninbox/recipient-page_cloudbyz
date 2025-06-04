import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

app.get('/api/data', async (req, res) => {
  try {
    const data = await fs.readFile(join(__dirname, 'src/data/app-data.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});