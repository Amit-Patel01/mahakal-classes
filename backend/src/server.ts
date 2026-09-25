import app from './app';
import { env } from './config/env';
import { prisma, connectMongo } from './config/db';
import { AdminSeederService } from './services/adminSeeder.service';

async function startServer() {
  try {
    console.log('[Mahakal Classes] Initializing server...');

    // 1. Connect to MongoDB native client & initialize GridFS Bucket
    await connectMongo();

    // 2. Connect Prisma ORM
    await prisma.$connect();
    console.log('[Prisma] Connected to MongoDB database successfully.');

    // 2.1 Automatically seed / ensure Master Admin from .env
    await AdminSeederService.seedAdmin();

    // 3. Start Express HTTP Server
    const server = app.listen(env.PORT, () => {
      console.log(`========================================================`);
      console.log(`🚀 Mahakal Classes API running in ${env.NODE_ENV} mode`);
      console.log(`📡 URL: http://localhost:${env.PORT}`);
      console.log(`📂 API Base: http://localhost:${env.PORT}/api/v1`);
      console.log(`⚡ MongoDB GridFS Streamer ready for video & materials`);
      console.log(`========================================================`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`[Shutdown] Received ${signal}. Closing server gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('[Shutdown] MongoDB and Prisma connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Mahakal Classes] Startup failure:', error);
    process.exit(1);
  }
}

startServer();
