import app from '../src/app';
import { connectMongo, prisma } from '../src/config/db';
import { AdminSeederService } from '../src/services/adminSeeder.service';

let isInitialized = false;

async function initServerless() {
  if (!isInitialized) {
    try {
      await connectMongo();
      await prisma.$connect();
      await AdminSeederService.seedAdmin();
      isInitialized = true;
    } catch (error) {
      console.error('[Serverless Init Error]:', error);
    }
  }
}

export default async function handler(req: any, res: any) {
  await initServerless();
  return app(req, res);
}
