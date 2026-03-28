import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — permitir llamadas desde el frontend en Vercel
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  // Validación automática de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist:        true,
    forbidNonWhitelisted: true,
    transform:        true,
  }));

  // Prefijo global de API
  app.setGlobalPrefix('api/v1');

  // Swagger (documentación automática)
  const config = new DocumentBuilder()
    .setTitle('ERP Grupo Workaholic')
    .setDescription('API del sistema ERP multiempresa')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
