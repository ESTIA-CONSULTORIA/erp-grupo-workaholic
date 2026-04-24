import { Controller, Post, Param, Body } from '@nestjs/common';
import { BulkImportService } from './bulk-import.service';

@Controller('companies/:companyId/import')
export class BulkImportController {
  constructor(private readonly svc: BulkImportService) {}

  @Post('gastos')
  importGastos(@Param('companyId') cid: string, @Body() body: { rows: any[] }) {
    return this.svc.importGastos(cid, body.rows || []);
  }

  @Post('proveedores')
  importProveedores(@Param('companyId') cid: string, @Body() body: { rows: any[] }) {
    return this.svc.importProveedores(cid, body.rows || []);
  }

  @Post('clientes')
  importClientes(@Param('companyId') cid: string, @Body() body: { rows: any[] }) {
    return this.svc.importClientes(cid, body.rows || []);
  }

  @Post('productos')
  importProductos(@Param('companyId') cid: string, @Body() body: { rows: any[] }) {
    return this.svc.importProductos(cid, body.rows || []);
  }

  @Post('insumos')
  importInsumos(@Param('companyId') cid: string, @Body() body: { rows: any[] }) {
    return this.svc.importInsumos(cid, body.rows || []);
  }

  @Post('empleados')
  importEmpleados(@Param('companyId') cid: string, @Body() body: { rows: any[] }) {
    return this.svc.importEmpleados(cid, body.rows || []);
  }

  @Post('cxc')
  importCxC(@Param('companyId') cid: string, @Body() body: { rows: any[] }) {
    return this.svc.importCxC(cid, body.rows || []);
  }

  @Post('cxp')
  importCxP(@Param('companyId') cid: string, @Body() body: { rows: any[] }) {
    return this.svc.importCxP(cid, body.rows || []);
  }

  @Post('compras')
  importCompras(@Param('companyId') cid: string, @Body() body: { rows: any[] }) {
    return this.svc.importCompras(cid, body.rows || []);
  }
}
