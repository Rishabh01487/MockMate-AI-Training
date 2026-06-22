import { connectToDatabase } from '../../lib/mongodb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('trainingdatas');

    const [totalSamples, unexported, byDomainRaw, bySourceRaw, byTypeRaw] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ exported: false }),
      collection.aggregate([
        { $group: { _id: '$domain', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      collection.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      collection.aggregate([
        { $group: { _id: '$questionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
    ]);

    const byDomain = {};
    byDomainRaw.forEach(({ _id, count }) => { if (_id) byDomain[_id] = count; });

    const bySource = {};
    bySourceRaw.forEach(({ _id, count }) => { if (_id) bySource[_id] = count; });

    const byType = {};
    byTypeRaw.forEach(({ _id, count }) => { if (_id) byType[_id] = count; });

    return res.status(200).json({
      totalSamples,
      unexported,
      byDomain,
      bySource,
      byType,
      estimatedFinetuneReady: totalSamples >= 500 ? 'Ready!' : `${totalSamples}/500`,
    });
  } catch (err) {
    console.error('[/api/training/stats] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
