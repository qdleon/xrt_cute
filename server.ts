import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Cloud encrypted backup storage in .data folder
const DATA_DIR = path.resolve(__dirname, '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const CLOUD_BACKUPS_PATH = path.join(DATA_DIR, 'encrypted_cloud_vault.json');

interface CloudBackupRecord {
  id: string;
  name: string;
  timestamp: string;
  encryptedPayload: string; // AES-GCM ciphertext bundle (base64)
  iv: string;
  salt: string;
  itemCount: number;
  checksum: string;
}

const loadBackups = (): CloudBackupRecord[] => {
  try {
    if (fs.existsSync(CLOUD_BACKUPS_PATH)) {
      const content = fs.readFileSync(CLOUD_BACKUPS_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading cloud backups:', err);
  }
  return [];
};

const saveBackups = (backups: CloudBackupRecord[]) => {
  try {
    fs.writeFileSync(CLOUD_BACKUPS_PATH, JSON.stringify(backups, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving cloud backups:', err);
  }
};

// API: Save new encrypted backup to cloud
app.post('/api/cloud-backup', (req, res) => {
  try {
    const { encryptedPayload, iv, salt, itemCount, checksum, name } = req.body;
    if (!encryptedPayload) {
      return res.status(400).json({ error: 'Missing encryptedPayload' });
    }

    const backups = loadBackups();
    const newRecord: CloudBackupRecord = {
      id: `cloud-snap-${Date.now()}`,
      name: name || `云端备份 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`,
      timestamp: new Date().toISOString(),
      encryptedPayload,
      iv: iv || '',
      salt: salt || '',
      itemCount: Number(itemCount) || 0,
      checksum: checksum || '',
    };

    // Keep up to 20 historic cloud snapshots
    const updated = [newRecord, ...backups].slice(0, 20);
    saveBackups(updated);

    res.json({
      success: true,
      backupId: newRecord.id,
      timestamp: newRecord.timestamp,
      message: '已成功加密存储于云端',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save cloud backup' });
  }
});

// API: Get latest encrypted backup
app.get('/api/cloud-backup/latest', (req, res) => {
  try {
    const backups = loadBackups();
    if (backups.length === 0) {
      return res.status(404).json({ message: '暂无云端备份' });
    }
    res.json(backups[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: List all cloud backup snapshots
app.get('/api/cloud-backup/list', (req, res) => {
  try {
    const backups = loadBackups();
    // Return metadata without giant payloads for fast listing
    const list = backups.map(b => ({
      id: b.id,
      name: b.name,
      timestamp: b.timestamp,
      itemCount: b.itemCount,
      checksum: b.checksum,
    }));
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get specific encrypted backup by ID
app.get('/api/cloud-backup/:id', (req, res) => {
  try {
    const backups = loadBackups();
    const found = backups.find(b => b.id === req.params.id);
    if (!found) {
      return res.status(404).json({ error: 'Backup snapshot not found' });
    }
    res.json(found);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete specific backup
app.delete('/api/cloud-backup/:id', (req, res) => {
  try {
    const backups = loadBackups();
    const filtered = backups.filter(b => b.id !== req.params.id);
    saveBackups(filtered);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount Vite middleware for development
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApexFlow full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
