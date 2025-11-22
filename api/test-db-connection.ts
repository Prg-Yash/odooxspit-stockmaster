/**
 * Test database connection and check Warehouse table
 */
import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Testing database connection...\n");
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connected successfully!\n");
    
    // Check if Warehouse table exists and get count
    const count = await prisma.warehouse.count();
    console.log(`📊 Found ${count} warehouses in database\n`);
    
    // Try to fetch all warehouses
    const warehouses = await prisma.warehouse.findMany({
      take: 5,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    console.log("Warehouses:", JSON.stringify(warehouses, null, 2));
    
  } catch (error) {
    console.error("❌ Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
