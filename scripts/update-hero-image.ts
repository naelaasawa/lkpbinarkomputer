import "dotenv/config";
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

const prisma = new PrismaClient({ adapter });

async function updateHeroImage() {
    try {
        // Get current settings
        const currentSettings = await prisma.siteSettings.findUnique({
            where: { key: 'landing_page' }
        });

        if (!currentSettings) {
            console.log('No settings found');
            return;
        }

        const settings = JSON.parse(currentSettings.value);

        // Update hero image URL
        settings.hero.imageUrl = '/images/hero-binar-full.jpg';

        // Save back to database
        await prisma.siteSettings.update({
            where: { key: 'landing_page' },
            data: { value: JSON.stringify(settings) }
        });

        console.log('✅ Hero image updated successfully to: /images/hero-binar-full.jpg');
    } catch (error) {
        console.error('❌ Error updating hero image:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateHeroImage();
