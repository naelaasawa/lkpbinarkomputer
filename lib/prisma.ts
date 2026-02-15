import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Validate database configuration
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number(process.env.DATABASE_PORT) || 3306,
};

// Log database connection attempt (only in development)
if (process.env.NODE_ENV !== "production") {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔌 Database Connection Configuration:");
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   User: ${dbConfig.user || '❌ NOT SET'}`);
    console.log(`   Password: ${dbConfig.password ? '✅ SET (length: ' + dbConfig.password.length + ')' : '❌ NOT SET'}`);
    console.log(`   Database: ${dbConfig.database || '❌ NOT SET'}`);

    // Warnings
    if (dbConfig.user === 'user' && dbConfig.password === 'password') {
        console.log("⚠️  WARNING: Using placeholder credentials!");
        console.log("   These look like example values. Please update .env with actual credentials.");
    }

    if (!dbConfig.user || !dbConfig.password) {
        console.log("❌ ERROR: Database credentials missing!");
        console.log("   Set DATABASE_USER and DATABASE_PASSWORD in .env file");
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

let prismaClient: PrismaClient;

try {
    // Create adapter with proper pool configuration
    const adapter = new PrismaMariaDb({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        connectionLimit: 10
    });

    prismaClient = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV !== "production" ? ['error', 'warn'] : ['error']
    });

    if (process.env.NODE_ENV !== "production") {
        console.log("✅ Prisma adapter initialized successfully\n");
    }

} catch (error) {
    console.error("❌ Failed to initialize Prisma adapter:", error);
    throw error;
}

export const prisma = globalForPrisma.prisma || prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;