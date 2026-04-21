import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PermissionsController } from './modules/permissions/permissions.controller';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: ['https://erp-grupoworka.netlify.app', 'http://localhost:3000'],
    credentials: true,
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api/v1');

  // Forzar registro manual del controlador de permisos
  // Esto soluciona el problema de que NestJS no lo escanea automáticamente
  try {
    const controller = app.get(PermissionsController);
    // Registrar explícitamente en el adaptador HTTP
    app.getHttpAdapter().registerRouter(
      PermissionsController as any,
      app.getHttpAdapter().getInstance()?.get(PermissionsController) || controller
    );
    console.log('✅ PermissionsController registrado manualmente');
  } catch (error) {
    console.error('❌ Error al registrar PermissionsController:', error.message);
  }

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
