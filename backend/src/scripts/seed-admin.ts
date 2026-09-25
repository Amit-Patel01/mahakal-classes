import { connectMongo, prisma } from '../config/db';
import { AdminSeederService } from '../services/adminSeeder.service';

async function main() {
  console.log('[Script] Starting manual Admin seed...');
  await connectMongo();
  await prisma.$connect();
  await AdminSeederService.seedAdmin();
  await prisma.$disconnect();
  console.log('[Script] Done! Admin account is ready.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[Script] Error:', err);
  process.exit(1);
});
