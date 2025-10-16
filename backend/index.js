import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  initDatabase,
  addEntry,
  getAllEntries,
  getVerifiedEntries,
  verifyEntry,
  checkIfExists,
  getRandomWinner
} from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
await initDatabase();

// Routes

// Submit lottery entry
app.post('/api/lottery/enter', async (req, res) => {
  try {
    const { name, email, instagramUsername } = req.body;

    // Validation
    if (!name || !email || !instagramUsername) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Clean Instagram username
    const cleanUsername = instagramUsername.replace('@', '').trim();

    // Check if already exists
    const exists = await checkIfExists(email, cleanUsername);
    if (exists) {
      return res.status(400).json({
        error: 'You have already entered the lottery with this email or Instagram username'
      });
    }

    // Add entry
    const result = await addEntry(name, email, cleanUsername);

    res.status(201).json({
      success: true,
      message: 'Entry submitted successfully! We will verify your follow and contact you if you win.',
      entryId: result.id
    });
  } catch (error) {
    console.error('Error adding entry:', error);
    res.status(500).json({ error: error.message || 'Failed to submit entry' });
  }
});

// Get all entries (admin)
app.get('/api/admin/entries', async (req, res) => {
  try {
    const entries = await getAllEntries();
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Get verified entries only (admin)
app.get('/api/admin/entries/verified', async (req, res) => {
  try {
    const entries = await getVerifiedEntries();
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching verified entries:', error);
    res.status(500).json({ error: 'Failed to fetch verified entries' });
  }
});

// Verify an entry (admin)
app.post('/api/admin/verify/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await verifyEntry(id);
    res.json({ success: true, message: 'Entry verified successfully' });
  } catch (error) {
    console.error('Error verifying entry:', error);
    res.status(500).json({ error: 'Failed to verify entry' });
  }
});

// Pick random winner from verified entries (admin)
app.get('/api/admin/pick-winner', async (req, res) => {
  try {
    const winner = await getRandomWinner();
    if (!winner) {
      return res.status(404).json({ error: 'No verified entries found' });
    }
    res.json({ winner });
  } catch (error) {
    console.error('Error picking winner:', error);
    res.status(500).json({ error: 'Failed to pick winner' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lottery API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - POST /api/lottery/enter - Submit lottery entry`);
  console.log(`  - GET  /api/admin/entries - View all entries`);
  console.log(`  - GET  /api/admin/entries/verified - View verified entries`);
  console.log(`  - POST /api/admin/verify/:id - Verify an entry`);
  console.log(`  - GET  /api/admin/pick-winner - Pick random winner`);
});
