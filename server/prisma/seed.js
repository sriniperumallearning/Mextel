const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create plans
    const basico = await prisma.plan.upsert({
        where: { name: 'Básico' },
        update: {},
        create: {
            name: 'Básico',
            price: 149.00,
            dataGB: 3,
            callMinutes: 500,
            smsCount: 100,
            features: JSON.stringify(['Navegación en México', 'Redes Sociales Ilimitadas (FB, WA, X)']),
        },
    });

    const estandar = await prisma.plan.upsert({
        where: { name: 'Estándar' },
        update: {},
        create: {
            name: 'Estándar',
            price: 249.00,
            dataGB: 8,
            callMinutes: -1, // -1 means unlimited
            smsCount: -1,
            features: JSON.stringify(['Navegación en México, EU y Canadá', 'Redes Sociales, Música y Video Incluido', '5G Incluido']),
        },
    });

    const pro = await prisma.plan.upsert({
        where: { name: 'Pro' },
        update: {},
        create: {
            name: 'Pro',
            price: 399.00,
            dataGB: 15,
            callMinutes: -1,
            smsCount: -1,
            features: JSON.stringify(['Todo en Estándar', 'Suscripción MEXTEL Video', 'Roaming Internacional (5GB)']),
        },
    });

    const elite = await prisma.plan.upsert({
        where: { name: 'Élite' },
        update: {},
        create: {
            name: 'Élite',
            price: 599.00,
            dataGB: -1, // unlimited
            callMinutes: -1,
            smsCount: -1,
            features: JSON.stringify(['Datos Ilimitados reales', '2 Suscripciones streaming a elegir', 'Soporte Premium 24/7']),
        },
    });

    // Create users
    const adminPassword = await bcrypt.hash('Admin@1234', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@mextel.mx' },
        update: {},
        create: {
            email: 'admin@mextel.mx',
            passwordHash: adminPassword,
            fullName: 'System Administrator',
            role: 'ADMIN',
        },
    });

    const customerPassword = await bcrypt.hash('Customer@1234', 10);

    // 1. Customer on Estandar
    const customer1 = await prisma.user.upsert({
        where: { email: 'customer@mextel.mx' },
        update: {},
        create: {
            email: 'customer@mextel.mx',
            passwordHash: customerPassword,
            fullName: 'Jane Doe',
            phone: '55-1234-5678',
            role: 'CUSTOMER',
            currentPlanId: estandar.id,
        },
    });

    await prisma.planChange.create({
        data: {
            userId: customer1.id,
            toPlanId: estandar.id,
            reason: 'Initial enrollment',
        }
    });

    // 2. Customer on Basico
    const customer2 = await prisma.user.upsert({
        where: { email: 'maria@mextel.mx' },
        update: {},
        create: {
            email: 'maria@mextel.mx',
            passwordHash: await bcrypt.hash('Maria@1234', 10),
            fullName: 'Maria Garcia',
            phone: '55-8765-4321',
            role: 'CUSTOMER',
            currentPlanId: basico.id,
        },
    });

    await prisma.planChange.create({
        data: {
            userId: customer2.id,
            toPlanId: basico.id,
            reason: 'Initial enrollment',
        }
    });

    // 3. Customer on Pro
    const customer3 = await prisma.user.upsert({
        where: { email: 'carlos@mextel.mx' },
        update: {},
        create: {
            email: 'carlos@mextel.mx',
            passwordHash: await bcrypt.hash('Carlos@1234', 10),
            fullName: 'Carlos Rodriguez',
            phone: '81-1122-3344',
            role: 'CUSTOMER',
            currentPlanId: pro.id,
        },
    });

    await prisma.planChange.create({
        data: {
            userId: customer3.id,
            toPlanId: pro.id,
            reason: 'Initial enrollment',
        }
    });

    // 4. Customer on Elite
    const customer4 = await prisma.user.upsert({
        where: { email: 'ana@mextel.mx' },
        update: {},
        create: {
            email: 'ana@mextel.mx',
            passwordHash: await bcrypt.hash('Ana@1234', 10),
            fullName: 'Ana Martinez',
            phone: '33-9988-7766',
            role: 'CUSTOMER',
            currentPlanId: elite.id,
        },
    });

    await prisma.planChange.create({
        data: {
            userId: customer4.id,
            toPlanId: elite.id,
            reason: 'Initial enrollment',
        }
    });

    console.log('Seeding complete!');
    console.log({
        admin,
        customers: [customer1.email, customer2.email, customer3.email, customer4.email],
        plans: [basico.name, estandar.name, pro.name, elite.name]
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
