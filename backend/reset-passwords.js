const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('mahakal_classes');
  
  const hash = await bcrypt.hash('Password@123', 10);
  console.log('New hash:', hash);
  
  const result = await db.collection('users').updateMany(
    {},
    { $set: { passwordHash: hash } }
  );
  
  console.log('Modified:', result.modifiedCount, 'users');
  
  const users = await db.collection('users').find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
  console.log('\nAll users:');
  users.forEach(u => console.log(' -', u.role, '|', u.email, '|', u.name));
  
  await client.close();
  console.log('\n✅ Done! Use Password@123 to login');
}

resetPasswords().catch(console.error);
