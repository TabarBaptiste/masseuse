import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

// Load environment variables
import 'dotenv/config';

async function bootstrap() {
  // Créer l'application avec rawBody activé pour les webhooks Stripe
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Enable cookie parsing for httpOnly cookies
  app.use(cookieParser());

  // Enable security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Nécessaire pour les images externes
  }));

  // Enable CORS for frontend
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: (origin: string, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) only in development
      if (!origin) {
        if (process.env.NODE_ENV === 'production') {
          return callback(new Error('Not allowed by CORS'));
        }
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
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

  // Configure Swagger - Only in development
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Masseuse API')
      .setDescription('API pour l\'application de réservation de massages')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3001);
  const appUrl = await app.getUrl();
  console.log(`Application is running on: ${appUrl}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger UI available at: ${appUrl}/api/docs`);
  }
}
void bootstrap();
