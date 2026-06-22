import { connectToDatabase } from '../../lib/mongodb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db } = await connectToDatabase();
    
    // Check connection stats
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    
    // Insert a test sample
    const result = await db.collection('trainingdatas').insertOne({
      instruction: "Test instruction " + new Date().toISOString(),
      input: "Test input",
      output: "Test output",
      domain: "test",
      questionType: "text",
      source: "debug-test",
      exported: false,
      timestamp: new Date()
    });

    // Get new count
    const count = await db.collection('trainingdatas').countDocuments({});

    return res.status(200).json({
      success: true,
      message: "Test sample inserted successfully!",
      insertedId: result.insertedId,
      collectionsInDb: names,
      totalSamplesNow: count
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
