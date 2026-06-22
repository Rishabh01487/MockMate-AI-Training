import { connectToDatabase } from '../../lib/mongodb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { instruction, input, output, domain, questionType, source } = req.body || {};
    if (!instruction || !output) return res.status(400).json({ error: 'Missing data' });

    const { db } = await connectToDatabase();
    const result = await db.collection('trainingdatas').insertOne({
      instruction, input: input || '', output, domain: domain || 'general',
      questionType: questionType || 'unknown', source: source || 'web',
      exported: false, timestamp: new Date()
    });

    return res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
