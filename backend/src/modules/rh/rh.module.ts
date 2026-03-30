import { Module } from '@nestjs/common';
import { RhService } from './rh.service';
import { RhController } from './rh.controller';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';

@Module({
  providers: [RhService, PayrollService],
  controllers: [RhController, PayrollController],
  exports: [RhService, PayrollService],
})
export class RhModule {}
