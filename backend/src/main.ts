import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PermissionsService } from './modules/permissions/permissions.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['https://erp-grupoworka.netlify.app', 'http://localhost:3000'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const permissionsService = app.get(PermissionsService);
  const httpAdapter = app.getHttpAdapter();

  // Registrar rutas manualmente (solución garantizada)
  httpAdapter.get('/api/v1/permissions/defaults', (req, res) => {
    res.status(200).json(permissionsService.getDefaultPermissions());
  });

  httpAdapter.get('/api/v1/permissions/all', async (req, res) => {
    const companyId = req.query.companyId as string;
    const all = await permissionsService.getAllPermissions(companyId);
    res.status(200).json(all);
  });

  httpAdapter.put('/api/v1/permissions/roles/:roleCode/modules/:module/actions/:action', async (req, res) => {
    const { roleCode, module, action } = req.params;
    const { allowed, companyId } = req.body;
    const updated = await permissionsService.updatePermission(roleCode, module, action, allowed, companyId);
    res.status(200).json(updated);
  });

  console.log('✅ Rutas de permisos registradas manualmente');

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
