import { PrismaClient, UserRole, DayOfWeek } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({} as any);

async function main() {
  console.log('🌱 Starting seed...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@masseuse.com' },
    update: {},
    create: {
      email: 'admin@masseuse.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+33 6 00 00 00 00',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create PRO User
  const proPassword = await bcrypt.hash('Pro123!', 10);
  const pro = await prisma.user.upsert({
    where: { email: 'pro@masseuse.com' },
    update: {},
    create: {
      email: 'pro@masseuse.com',
      password: proPassword,
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '+33 6 11 11 11 11',
      role: UserRole.PRO,
      emailVerified: true,
    },
  });
  console.log('✅ PRO user created:', pro.email);

  // Create sample services
  const services = [
    {
      name: 'Massage Suédois',
      description: 'Un massage relaxant qui détend les muscles en profondeur. Idéal pour réduire le stress et améliorer la circulation sanguine.',
      duration: 60,
      price: 70,
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Massage Deep Tissue',
      description: 'Massage thérapeutique ciblant les couches profondes des muscles et des tissus conjonctifs. Parfait pour soulager les tensions chroniques.',
      duration: 90,
      price: 95,
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'Massage aux Pierres Chaudes',
      description: 'Massage utilisant des pierres volcaniques chaudes pour détendre les muscles et apaiser l\'esprit.',
      duration: 75,
      price: 85,
      displayOrder: 3,
      isActive: true,
    },
    {
      name: 'Massage Express',
      description: 'Massage rapide et efficace pour soulager les tensions du dos et de la nuque. Parfait pour une pause détente.',
      duration: 30,
      price: 40,
      displayOrder: 4,
      isActive: true,
    },
  ];

  for (const service of services) {
    const created = await prisma.service.upsert({
      where: { id: service.name }, // Using name as temporary unique identifier
      update: {},
      create: service,
    });
    console.log(`✅ Service created: ${created.name}`);
  }

  // Create weekly availability (Monday to Saturday, 9:00 - 18:00)
  const workingDays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];

  for (const day of workingDays) {
    await prisma.weeklyAvailability.upsert({
      where: {
        dayOfWeek_startTime_endTime: {
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
        },
      },
      update: {},
      create: {
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      },
    });
    console.log(`✅ Availability created for ${day}`);
  }

  // Create site settings
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: 'default' }, // Using a fixed ID
    update: {},
    create: {
      salonName: 'Zen Massage',
      salonDescription: 'Bienvenue chez Zen Massage, votre havre de paix et de relaxation. Nous vous proposons une gamme complète de massages thérapeutiques et relaxants pour votre bien-être.',
      salonAddress: '123 Rue de la Paix, 75001 Paris',
      salonPhone: '+33 1 23 45 67 89',
      salonEmail: 'contact@zenmassage.fr',
      defaultOpenTime: '09:00',
      defaultCloseTime: '18:00',
      bookingAdvanceMinDays: 1,
      bookingAdvanceMaxDays: 60,
      cancellationDeadlineHours: 24,
      emailNotificationsEnabled: true,
      reminderDaysBefore: 1,
    },
  });
  console.log('✅ Site settings created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@masseuse.com / Admin123!');
  console.log('PRO: pro@masseuse.com / Pro123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
