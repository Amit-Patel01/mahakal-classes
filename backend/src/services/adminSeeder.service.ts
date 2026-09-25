import { getNativeDb } from '../config/db';
import { env } from '../config/env';
import { AuthService } from './auth.service';

export class AdminSeederService {
  /**
   * Automatically verifies and seeds the master Admin account directly in MongoDB.
   * Safe to call on every server startup or via manual seed commands.
   */
  static async seedAdmin(): Promise<void> {
    try {
      const email = env.ADMIN_EMAIL.trim().toLowerCase();
      const rawMobile = env.ADMIN_MOBILE.trim();
      const mobile = rawMobile.replace(/\D/g, '').slice(-10) || rawMobile;
      const name = env.ADMIN_NAME.trim();
      const rawPassword = env.ADMIN_PASSWORD;

      if (!email || !rawPassword) {
        console.warn('[Admin Seeder] ADMIN_EMAIL or ADMIN_PASSWORD not configured in .env. Skipping admin seeding.');
        return;
      }

      const db = getNativeDb();
      const usersCol = db.collection('users');

      // Check if admin user already exists with either email or mobile
      const existingUser = await usersCol.findOne({
        $or: [{ email }, { mobile }],
      });

      const passwordHash = await AuthService.hashPassword(rawPassword);

      if (!existingUser) {
        const result = await usersCol.insertOne({
          name,
          email,
          mobile,
          passwordHash,
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`[Admin Seeder] ✅ Master Admin created in MongoDB:`);
        console.log(`               ID: ${result.insertedId}`);
        console.log(`               Name: ${name}`);
        console.log(`               Email: ${email}`);
        console.log(`               Mobile: ${mobile}`);
        console.log(`               Password: ${rawPassword}`);
        console.log(`               Role: ADMIN`);
      } else {
        // Ensure credentials, password hash and ADMIN role are updated to match .env
        await usersCol.updateOne(
          { _id: existingUser._id },
          {
            $set: {
              name,
              email,
              mobile,
              passwordHash,
              role: 'ADMIN',
              isActive: true,
              updatedAt: new Date(),
            },
          }
        );
        console.log(`[Admin Seeder] ✅ Master Admin verified & updated in MongoDB:`);
        console.log(`               ID: ${existingUser._id}`);
        console.log(`               Name: ${name}`);
        console.log(`               Email: ${email}`);
        console.log(`               Mobile: ${mobile}`);
        console.log(`               Password: ${rawPassword}`);
        console.log(`               Role: ADMIN`);
      }
    } catch (error: any) {
      console.error('[Admin Seeder] ❌ Failed to seed admin user:', error?.message || error);
    }
  }
}
