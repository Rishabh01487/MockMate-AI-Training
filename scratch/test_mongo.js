import { MongoClient } from 'mongodb';

const URI = 'mongodb+srv://mockmate:Rishabh%4001@mockmate.aqjlnmx.mongodb.net/mockmate?retryWrites=true&w=majority';

async function test() {
  try {
    console.log("Connecting to MongoDB...");
    const client = await MongoClient.connect(URI);
    console.log("Connected!");
    const db = client.db('mockmate');
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Check trainingdatas collection
    const collection = db.collection('trainingdatas');
    const total = await collection.countDocuments({});
    console.log("Total documents in trainingdatas:", total);
    
    // Print a sample
    if (total > 0) {
      const sample = await collection.findOne({});
      console.log("Sample document:", sample);
    }
    
    await client.close();
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
