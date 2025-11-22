import { PrismaClient, UserRole } from '../../src/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../../src/lib/auth';

const pool = new Pool({ connectionString: process.env.DATABASE_URL_TEST });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export interface SeededUser {
    id: string;
    email: string;
    password: string;
    name: string | null;
    role: UserRole;
}

export interface SeededWarehouse {
    id: string;
    name: string;
    code: string;
}

export interface SeededProduct {
    id: string;
    sku: string;
    name: string;
    warehouseId: string;
}

export interface SeededLocation {
    id: string;
    name: string;
    warehouseId: string;
}

export interface SeededVendor {
    id: string;
    name: string;
    email: string | null;
}

export interface SeededData {
    users: {
        owner: SeededUser;
        manager: SeededUser;
        staff: SeededUser;
    };
    warehouses: {
        main: SeededWarehouse;
        secondary: SeededWarehouse;
    };
    locations: {
        mainStorage: SeededLocation;
        secondaryStorage: SeededLocation;
    };
    categories: {
        electronics: { id: string; name: string };
        furniture: { id: string; name: string };
    };
    products: {
        laptop: SeededProduct;
        mouse: SeededProduct;
    };
    vendors: {
        supplier1: SeededVendor;
        supplier2: SeededVendor;
    };
}

/**
 * Seed test database with initial data
 */
export async function seedTestDatabase(): Promise<SeededData> {
    console.log('🌱 Seeding test database...');

    try {
        // Create users
        const ownerPassword = 'Owner@123';
        const managerPassword = 'Manager@123';
        const staffPassword = 'Staff@123';

        const owner = await prisma.user.create({
            data: {
                email: 'owner@test.com',
                password: await hashPassword(ownerPassword),
                name: 'Test Owner',
                role: UserRole.OWNER,
                emailVerified: true,
            },
        });

        const manager = await prisma.user.create({
            data: {
                email: 'manager@test.com',
                password: await hashPassword(managerPassword),
                name: 'Test Manager',
                role: UserRole.MANAGER,
                emailVerified: true,
            },
        });

        const staff = await prisma.user.create({
            data: {
                email: 'staff@test.com',
                password: await hashPassword(staffPassword),
                name: 'Test Staff',
                role: UserRole.STAFF,
                emailVerified: true,
            },
        });

        console.log('✅ Created test users');

        // Create warehouses
        const mainWarehouse = await prisma.warehouse.create({
            data: {
                name: 'Main Test Warehouse',
                code: 'WH-MAIN',
                address: '123 Test Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
                postalCode: '400001',
                isActive: true,
            },
        });

        const secondaryWarehouse = await prisma.warehouse.create({
            data: {
                name: 'Secondary Test Warehouse',
                code: 'WH-SEC',
                address: '456 Test Avenue',
                city: 'Delhi',
                state: 'Delhi',
                country: 'India',
                postalCode: '110001',
                isActive: true,
            },
        });

        console.log('✅ Created test warehouses');

        // Add manager and staff to main warehouse
        await prisma.warehouseMember.createMany({
            data: [
                {
                    warehouseId: mainWarehouse.id,
                    userId: manager.id,
                    role: 'MANAGER',
                },
                {
                    warehouseId: mainWarehouse.id,
                    userId: staff.id,
                    role: 'STAFF',
                },
            ],
        });

        console.log('✅ Added warehouse members');

        // Create locations
        const mainStorage = await prisma.location.create({
            data: {
                name: 'Main Storage',
                code: 'LOC-A1',
                warehouseId: mainWarehouse.id,
                aisle: 'A',
                rack: '1',
                shelf: '1',
                bin: 'A',
                isActive: true,
            },
        });

        const secondaryStorage = await prisma.location.create({
            data: {
                name: 'Secondary Storage',
                code: 'LOC-B2',
                warehouseId: mainWarehouse.id,
                aisle: 'B',
                rack: '2',
                shelf: '2',
                bin: 'B',
                isActive: true,
            },
        });

        console.log('✅ Created test locations');

        // Create product categories
        const electronicsCategory = await prisma.productCategory.create({
            data: {
                name: 'Electronics',
                description: 'Electronic items',
                isActive: true,
            },
        });

        const furnitureCategory = await prisma.productCategory.create({
            data: {
                name: 'Furniture',
                description: 'Furniture items',
                isActive: true,
            },
        });

        console.log('✅ Created test categories');

        // Create products
        const laptop = await prisma.product.create({
            data: {
                sku: 'LAPTOP-001',
                name: 'Test Laptop',
                description: 'A test laptop',
                warehouseId: mainWarehouse.id,
                categoryId: electronicsCategory.id,
                unitOfMeasure: 'PIECE',
                reorderLevel: 5,
                isActive: true,
            },
        });

        const mouse = await prisma.product.create({
            data: {
                sku: 'MOUSE-001',
                name: 'Test Mouse',
                description: 'A test mouse',
                warehouseId: mainWarehouse.id,
                categoryId: electronicsCategory.id,
                unitOfMeasure: 'PIECE',
                reorderLevel: 10,
                isActive: true,
            },
        });

        console.log('✅ Created test products');

        // Create vendors
        const supplier1 = await prisma.vendor.create({
            data: {
                name: 'Test Supplier 1',
                email: 'supplier1@test.com',
                phone: '+91-9876543210',
                address: '789 Supplier Street',
                isActive: true,
            },
        });

        const supplier2 = await prisma.vendor.create({
            data: {
                name: 'Test Supplier 2',
                email: 'supplier2@test.com',
                phone: '+91-9876543211',
                address: '987 Supplier Avenue',
                isActive: true,
            },
        });

        console.log('✅ Created test vendors');

        // Create initial stock
        await prisma.stockLevel.createMany({
            data: [
                {
                    productId: laptop.id,
                    warehouseId: mainWarehouse.id,
                    locationId: mainStorage.id,
                    quantity: 10,
                },
                {
                    productId: mouse.id,
                    warehouseId: mainWarehouse.id,
                    locationId: mainStorage.id,
                    quantity: 50,
                },
            ],
        });

        console.log('✅ Created initial stock levels');

        console.log('🎉 Database seeding complete!\n');
        console.log('Test Credentials:');
        console.log(`Owner: ${owner.email} / ${ownerPassword}`);
        console.log(`Manager: ${manager.email} / ${managerPassword}`);
        console.log(`Staff: ${staff.email} / ${staffPassword}\n`);

        return {
            users: {
                owner: { ...owner, password: ownerPassword },
                manager: { ...manager, password: managerPassword },
                staff: { ...staff, password: staffPassword },
            },
            warehouses: {
                main: mainWarehouse,
                secondary: secondaryWarehouse,
            },
            locations: {
                mainStorage,
                secondaryStorage,
            },
            categories: {
                electronics: electronicsCategory,
                furniture: furnitureCategory,
            },
            products: {
                laptop,
                mouse,
            },
            vendors: {
                supplier1,
                supplier2,
            },
        };
    } catch (error) {
        console.error('❌ Failed to seed database:', error);
        throw error;
    }
}

// Run seed if executed directly
if (require.main === module) {
    seedTestDatabase()
        .then(() => {
            console.log('Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        })
        .finally(() => {
            prisma.$disconnect();
        });
}
