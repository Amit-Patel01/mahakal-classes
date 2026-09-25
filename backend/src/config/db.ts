import { PrismaClient } from '@prisma/client';
import { MongoClient, GridFSBucket, Db } from 'mongodb';
import { env } from './env';

// Prisma Client Singleton
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// MongoDB Native Client & GridFS Bucket for High-Performance File Streaming
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let gridfsBucket: GridFSBucket | null = null;

export async function connectMongo(): Promise<{
  db: Db;
  bucket: GridFSBucket;
}> {
  if (mongoClient && mongoDb && gridfsBucket) {
    return { db: mongoDb, bucket: gridfsBucket };
  }

  try {
    mongoClient = new MongoClient(env.DATABASE_URL);
    await mongoClient.connect();
    
    // Extract db name from connection string or default
    const parsedUri = new URL(env.DATABASE_URL.replace('mongodb://', 'http://').replace('mongodb+srv://', 'https://'));
    const dbName = parsedUri.pathname.replace('/', '') || 'mahakal_classes';
    
    mongoDb = mongoClient.db(dbName);
    gridfsBucket = new GridFSBucket(mongoDb, {
      bucketName: env.GRIDFS_BUCKET_NAME,
      chunkSizeBytes: 255 * 1024, // 255 KB standard chunks for streaming
    });

    console.log(`[MongoDB] Connected successfully to "${dbName}" with GridFSBucket "${env.GRIDFS_BUCKET_NAME}"`);
    return { db: mongoDb, bucket: gridfsBucket };
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    throw error;
  }
}

export function getGridFSBucket(): GridFSBucket {
  if (!gridfsBucket) {
    throw new Error('GridFS Bucket is not initialized. Call connectMongo() first.');
  }
  return gridfsBucket;
}

export function getNativeDb(): Db {
  if (!mongoDb) {
    throw new Error('Native MongoDB Db is not initialized. Call connectMongo() first.');
  }
  return mongoDb;
}
