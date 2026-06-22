import { connectToDatabase } from '../../lib/mongodb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('trainingdatas');

    const samples = await collection
      .find({ exported: false })
      .sort({ timestamp: 1 })
      .toArray();

    if (samples.length === 0) {
      return res.status(200).json({ exported: 0, message: 'No new samples.', data: [] });
    }

    const ids = samples.map(s => s._id);
    await collection.updateMany(
      { _id: { $in: ids } },
      { $set: { exported: true, exportedAt: new Date() } }
    );

    return res.status(200).json({
      exported: samples.length,
      message: `Exported ${samples.length} samples.`,
      data: samples.map(s => JSON.stringify({ instruction: s.instruction || '', input: s.input || '', output: s.output || '' })),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
