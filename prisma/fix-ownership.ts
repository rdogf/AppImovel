import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing property ownership...');

    // Find master user
    const masterUser = await prisma.user.findFirst({
        where: { role: 'master' }
    });

    if (!masterUser) {
        console.log('❌ Master user not found');
        return;
    }

    console.log(`✅ Found master user: ${masterUser.email}`);

    // Update all properties without userId to belong to master
    const updated = await prisma.property.updateMany({
        where: { userId: null },
        data: { userId: masterUser.id }
    });

    console.log(`✅ Updated ${updated.count} properties to belong to master user`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
