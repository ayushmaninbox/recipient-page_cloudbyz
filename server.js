import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/data', async (req, res) => {
  try {
    const data = await fs.readFile(join(__dirname, 'src/data/app-data.json'), 'utf8');
    const otherReasonsData = await fs.readFile(join(__dirname, 'src/data/other-reasons.json'), 'utf8');
    const appData = JSON.parse(data);
    const { otherReasons } = JSON.parse(otherReasonsData);
    
    res.json({
      ...appData,
      signatureReasons: [...appData.signatureReasons, ...otherReasons]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.post('/api/reasons', async (req, res) => {
  try {
    const { reason } = req.body;
    const filePath = join(__dirname, 'src/data/other-reasons.json');
    const data = await fs.readFile(filePath, 'utf8');
    const { otherReasons } = JSON.parse(data);
    
    if (!otherReasons.includes(reason)) {
      otherReasons.push(reason);
      await fs.writeFile(filePath, JSON.stringify({ otherReasons }, null, 2));
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save reason' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});