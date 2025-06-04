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
    const appData = JSON.parse(data);
    
    res.json({
      ...appData,
      signatureReasons: [...appData.signatureReasons],
      otherReasons: appData.otherReasons || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.post('/api/reasons', async (req, res) => {
  try {
    const { reason, addToSignatureReasons } = req.body;
    const appDataPath = join(__dirname, 'src/data/app-data.json');
    const appData = JSON.parse(await fs.readFile(appDataPath, 'utf8'));
    
    if (addToSignatureReasons) {
      if (!appData.signatureReasons.includes(reason)) {
        appData.signatureReasons.push(reason);
      }
    } else {
      if (!appData.otherReasons) {
        appData.otherReasons = [];
      }
      if (!appData.otherReasons.includes(reason)) {
        appData.otherReasons.push(reason);
      }
    }
    
    await fs.writeFile(appDataPath, JSON.stringify(appData, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save reason' });
  }
});

app.delete('/api/reasons/:reason', async (req, res) => {
  try {
    const reasonToDelete = decodeURIComponent(req.params.reason);
    const appDataPath = join(__dirname, 'src/data/app-data.json');
    const appData = JSON.parse(await fs.readFile(appDataPath, 'utf8'));
    
    if (appData.otherReasons) {
      appData.otherReasons = appData.otherReasons.filter(reason => reason !== reasonToDelete);
      await fs.writeFile(appDataPath, JSON.stringify(appData, null, 2));
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reason' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});