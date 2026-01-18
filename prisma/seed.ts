import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create master admin user
    const masterPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

    const masterUser = await prisma.user.upsert({
        where: { email: process.env.ADMIN_EMAIL || 'admin@exemplo.com' },
        update: { role: 'master' },
        create: {
            email: process.env.ADMIN_EMAIL || 'admin@exemplo.com',
            password: masterPassword,
            name: 'Administrador Master',
            role: 'master',
        },
    });
    console.log(`✅ Created master user: ${masterUser.email}`);

    // Create default settings
    const settings = await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            companyName: 'Minha Imobiliária',
            primaryColor: '#1a1a2e',
            secondaryColor: '#e94560',
            accentColor: '#f5a623',
            aboutTitle: 'Sobre Nós',
            aboutText: 'Somos uma imobiliária especializada em imóveis de alto padrão. Nossa missão é ajudar você a encontrar o imóvel dos seus sonhos.',
        },
    });
    console.log(`✅ Created settings: ${settings.companyName}`);

    // Create sample property linked to master user
    const existingProperty = await prisma.property.findFirst({
        where: { title: 'Cobertura Riserva Golf' }
    });

    if (!existingProperty) {
        const property = await prisma.property.create({
            data: {
                title: 'Cobertura Riserva Golf',
                address: 'Av. Ermanno Dallari, 363',
                neighborhood: 'Barra da Tijuca',
                city: 'Rio de Janeiro',
                state: 'RJ',
                totalArea: 555.81,
                propertyType: 'cobertura',
                bedrooms: 5,
                suites: 3,
                bathrooms: 6,
                parkingSpaces: 5,
                characteristics: 'Apartamento de 5 suítes, sendo transformada em 3 suítes, 5 vagas de garagem + 1 vaga box.\nApartamento superexclusivo vendido com porteira fechada.',
                price: 16900000,
                condoFee: 12000,
                iptu: 29000,
                status: 'disponivel',
                featured: true,
                userId: masterUser.id,
            },
        });
        console.log(`✅ Created property: ${property.title}`);
    }

    console.log('✅ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
