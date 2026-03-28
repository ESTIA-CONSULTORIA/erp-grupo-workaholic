// ─── auth.controller.ts ───────────────────────────────────────
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService }   from './auth.service';
import { JwtAuthGuard }  from './guards/jwt-auth.guard';
import { IsEmail, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail()    email:    string;
  @IsString()
  @MinLength(6) password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    return this.auth.login(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.auth.getProfile(req.user.sub);
  }
}
