import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, CompanyAccessGuard } from './auth.guards';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'erp-secret-2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtAuthGuard, CompanyAccessGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, CompanyAccessGuard, JwtModule],
})
export class AuthModule {}
