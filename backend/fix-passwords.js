const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  // Connect to port 27018 (same as backend uses)
  const url = 'mongodb://127.0.0.1:27018/mahakal_classes?replicaSet=rs0&directConnection=true';
  const client = new MongoClient(url);
  await client.connect();
  const db = client.db('mahakal_classes');
  
  const userCount = await db.collection('users').countDocuments();
  console.log('Users found on port 27018:', userCount);
  
  if (userCount > 0) {
    // Reset all passwords
    const hash = await bcrypt.hash('Password@123', 10);
    const result = await db.collection('users').updateMany({}, { $set: { passwordHash: hash } });
    console.log('Password updated for', result.modifiedCount, 'users');
    
    const users = await db.collection('users').find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
    console.log('\nAll users:');
    users.forEach(u => console.log(' ', u.role, '|', u.email, '|', u.name));
    console.log('\n✅ Now try login with Password@123');
  } else {
    console.log('❌ No users found. Run seed first.');
    // List all collections
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name));
  }
  
  await client.close();
}

fixPasswords().catch(console.error);
