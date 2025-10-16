import { MongoClient } from 'mongodb';

let client;
let db;
let entriesCollection;

// Initialize database connection
export async function initDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lottery-app';

    client = new MongoClient(mongoUri);
    await client.connect();

    db = client.db();
    entriesCollection = db.collection('entries');

    // Create unique index on email and instagram_username
    await entriesCollection.createIndex({ email: 1 }, { unique: true });
    await entriesCollection.createIndex({ instagram_username: 1 }, { unique: true });

    console.log('MongoDB connected and initialized');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Add lottery entry
export async function addEntry(name, email, instagramUsername) {
  try {
    const result = await entriesCollection.insertOne({
      name,
      email,
      instagram_username: instagramUsername,
      verified: false,
      created_at: new Date()
    });

    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('This email or Instagram username has already been entered');
    }
    throw error;
  }
}

// Get all entries
export async function getAllEntries() {
  const entries = await entriesCollection
    .find({})
    .sort({ created_at: -1 })
    .toArray();

  // Convert MongoDB _id to id for compatibility
  return entries.map(entry => ({
    id: entry._id.toString(),
    name: entry.name,
    email: entry.email,
    instagram_username: entry.instagram_username,
    verified: entry.verified ? 1 : 0,
    created_at: entry.created_at
  }));
}

// Get verified entries only
export async function getVerifiedEntries() {
  const entries = await entriesCollection
    .find({ verified: true })
    .sort({ created_at: -1 })
    .toArray();

  // Convert MongoDB _id to id for compatibility
  return entries.map(entry => ({
    id: entry._id.toString(),
    name: entry.name,
    email: entry.email,
    instagram_username: entry.instagram_username,
    verified: entry.verified ? 1 : 0,
    created_at: entry.created_at
  }));
}

// Verify an entry
export async function verifyEntry(id) {
  const { ObjectId } = await import('mongodb');
  await entriesCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { verified: true } }
  );
}

// Check if user already entered
export async function checkIfExists(email, instagramUsername) {
  const result = await entriesCollection.findOne({
    $or: [
      { email },
      { instagram_username: instagramUsername }
    ]
  });
  return result !== null;
}

// Get random winner from verified entries
export async function getRandomWinner() {
  const entries = await getVerifiedEntries();
  if (entries.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * entries.length);
  return entries[randomIndex];
}

// Close database connection (useful for cleanup)
export async function closeDatabase() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

export { db, entriesCollection };
