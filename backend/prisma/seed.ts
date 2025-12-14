import { PrismaClient, UserRole, DayOfWeek } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
  const proPassword = await bcrypt.hash('Proo123!', 10);
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
  // Clear existing services
  await prisma.service.deleteMany();
  console.log('🗑️ Cleared existing services');

  // Create sample services
  const services = [
    {
      name: 'Massage tonique',
      description:
        "Le massage tonique prépare et apaise les muscles avant et après l'effort. Il est également recommandé aux personnes très tendues ou stressées. Ce massage favorise l'élimination des toxines et relance la circulation sanguine et lymphatique.",
      duration: 45,
      price: 80,
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Massage face postérieure',
      description:
        "Ce massage cible le dos, l'arrière des jambes et des cuisses. Il inclut également un massage du crâne pour stimuler la circulation sanguine et apaiser le mental. Idéal pour les personnes ressentant une charge mentale ou physique.",
      duration: 30,
      price: 35,
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'Massage du dos',
      description:
        'Ce massage permet de dénouer les tensions accumulées, améliorer la posture et soulager les courbatures. Il oxygène le corps, stimule la circulation et favorise un sommeil réparateur. Idéal en fin de journée ou après un effort physique.',
      duration: 20,
      price: 25,
      displayOrder: 3,
      isActive: true,
    },
    {
      name: "Le massage by N'J",
      description:
        "Ce massage alliant tonicité, effleurages et relaxation vous transportera vers une détente profonde. Débutant par un massage tonique, votre circulation sanguine et lymphatique sera relancée ce qui permettra de drainer les toxines accumulées. Vos muscles seront détendus. Par la suite, les manipulations du massage relaxant viendront calmer toute cette agitation afin d'apaiser le mental et le corps. Enfin, des effleurages vous permettront de lacher-prise et de vous relaxer.",
      duration: 75,
      price: 25,
      displayOrder: 4,
      isActive: true,
    },
    {
      name: 'Massage relaxant',
      description:
        "Le massage relaxant permet d'éliminer l'anxiété et le stress accumulés. Il vise à relancer la circulation sanguine et lymphatique et contribue au bien-être du corps et de l'esprit.",
      duration: 60,
      price: 65,
      displayOrder: 5,
      isActive: true,
    },
    {
      name: 'Massage prénatal',
      description:
        'Massage spécialement adapté aux femmes enceintes pour soulager les tensions et favoriser le bien-être pendant la grossesse.',
      duration: 40,
      price: 60,
      displayOrder: 6,
      isActive: true,
    },
  ];

  for (const service of services) {
    const created = await prisma.service.create({
      data: service,
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
      salonName: "Salon Aly Dous'heure Le Robert Martinique",
      salonDescription:
        'Découvrez mes massages relaxants et toniques dans mon salon au Robert. Tarifs de 25€ à 80€, sur rendez-vous uniquement.',
      salonAddress: 'Le Robert, Martinique',
      salonPhone: '+596 596 XX XX XX', // Placeholder for Martinique number
      salonEmail: 'contact@alydousheure.com',
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

  // Create a test booking for the PRO user
  // const testService = await prisma.service.findFirst({
  //   where: { name: 'Massage tonique' },
  // });

  // if (testService) {
  //   const testBooking = await prisma.booking.create({
  //     data: {
  //       userId: pro.id,
  //       serviceId: testService.id,
  //       date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  //       startTime: '10:00',
  //       endTime: '10:45',
  //       status: 'CONFIRMED',
  //       priceAtBooking: testService.price,
  //       notes: 'Réservation de test pour démonstration',
  //     },
  //   });
  //   console.log('✅ Test booking created for PRO user');
  // }

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
