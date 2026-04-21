import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: ['https://erp-grupoworka.netlify.app', 'http://localhost:3000'],
    credentials: true,
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
