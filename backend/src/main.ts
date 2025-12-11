import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Load environment variables
import 'dotenv/config';

async function bootstrap() {
  // Créer l'application avec rawBody activé pour les webhooks Stripe
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Enable CORS for frontend
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:3000', 'https://alydousheure.netlify.app'];

  app.enableCors({
    origin: (origin: string, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Masseuse API')
    .setDescription('API pour l\'application de réservation de massages')
    .setVersion('1.0')
    // .addTag('auth', 'Authentification')
    // .addTag('users', 'Utilisateurs')
    // .addTag('services', 'Services')
    // .addTag('bookings', 'Réservations')
    // .addTag('availability', 'Disponibilités')
    // .addTag('reviews', 'Avis')
    // .addTag('blocked-slots', 'Créneaux bloqués')
    // .addTag('site-settings', 'Paramètres du site')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI available at: ${await app.getUrl()}/api/docs`);
}
void bootstrap();
