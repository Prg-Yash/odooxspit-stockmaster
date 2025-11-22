import { PrismaClient } from '../../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { execSync } from 'child_process';
import './test-env';

const pool = new Pool({ connectionString: process.env.DATABASE_URL_TEST });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

/**
 * Reset database before all tests
 * This runs migrations and clears all data
 */
export async function resetDatabase() {
  try {
    console.log('🔄 Resetting test database...');
    
    // Run Prisma migrate reset with force flag
    execSync('npx prisma migrate reset --force --skip-seed', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    
    console.log('✅ Test database reset complete');
  } catch (error) {
    console.error('❌ Failed to reset test database:', error);
    throw error;
  }
}

/**
 * Clean all tables for test isolation
 */
export async function cleanDatabase() {
  try {
    // Delete in reverse order of dependencies
    await prisma.$transaction([
      prisma.stockMovement.deleteMany(),
      prisma.stockLevel.deleteMany(),
      prisma.deliveryItem.deleteMany(),
      prisma.delivery.deleteMany(),
      prisma.receiptItem.deleteMany(),
      prisma.receipt.deleteMany(),
      prisma.vendor.deleteMany(),
      prisma.product.deleteMany(),
      prisma.productCategory.deleteMany(),
      prisma.location.deleteMany(),
      prisma.warehouseMember.deleteMany(),
      prisma.warehouse.deleteMany(),
      prisma.refreshToken.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  } catch (error) {
    console.error('Failed to clean database:', error);
    throw error;
  }
}

/**
 * Disconnect Prisma client
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

/**
 * Setup function to run before all tests
 */
export async function setupTestDatabase() {
  // Note: Run prisma migrate reset manually before running tests
  // or uncomment the line below (slower)
  // await resetDatabase();
  
  await cleanDatabase();
}

/**
 * Teardown function to run after all tests
 */
export async function teardownTestDatabase() {
  await cleanDatabase();
  await disconnectDatabase();
}
