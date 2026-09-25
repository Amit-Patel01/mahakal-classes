const { MongoClient } = require('../backend/node_modules/mongodb');

async function initReplica() {
  const uri = 'mongodb://127.0.0.1:27017/?directConnection=true';
  console.log('[ReplicaSet] Checking local MongoDB connection at 127.0.0.1:27017...');

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const adminDb = client.db('admin');

    try {
      const status = await adminDb.command({ replSetGetStatus: 1 });
      console.log(`[ReplicaSet] Replica set already active: "${status.set}" (State: ${status.myState})`);
      await client.close();
      return;
    } catch (err) {
      if (err.codeName === 'NotYetInitialized' || err.message.includes('no replset config')) {
        console.log('[ReplicaSet] Initializing replica set "rs0"...');
        const res = await adminDb.command({
          replSetInitiate: {
            _id: 'rs0',
            members: [{ _id: 0, host: '127.0.0.1:27017' }],
          },
        });
        console.log('[ReplicaSet] Initiated successfully:', res);
      } else {
        console.log('[ReplicaSet] Status message:', err.message);
      }
    }

    await client.close();
  } catch (error) {
    console.error('[ReplicaSet] Note: Could not connect to local MongoDB. Ensure mongod is running.');
    console.error(error.message);
  }
}

initReplica();
