import { Controller, Post, Put, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }
  @Post('verify-pin')
  verifyPin(@Body() body: { companyId: string; pin: string }) {
    return this.auth.verifyPin(body.companyId, body.pin);
  }

  @Put('set-pin')
  setPin(@Body() body: { userId: string; pin: string }) {
    return this.auth.setPin(body.userId, body.pin);
  }
}
