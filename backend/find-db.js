const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function findAndFix() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  
  // List all databases
  const adminDb = client.db('admin');
  const dbs = await adminDb.admin().listDatabases();
  console.log('All databases:');
  dbs.databases.forEach(d => console.log(' -', d.name, '(', d.sizeOnDisk, 'bytes)'));
  
  // Check each for users collection
  for (const dbInfo of dbs.databases) {
    if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
    const db = client.db(dbInfo.name);
    const collections = await db.listCollections().toArray();
    const colNames = collections.map(c => c.name);
    if (colNames.includes('users')) {
      const count = await db.collection('users').countDocuments();
      console.log(`\n✅ Found 'users' in DB: ${dbInfo.name} (${count} users)`);
      const users = await db.collection('users').find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
      users.forEach(u => console.log('  -', u.role, '|', u.email));
    }
  }
  
  await client.close();
}

findAndFix().catch(console.error);
