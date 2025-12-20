import { Controller, Post, Body, UseGuards, Get, Param, Patch, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

// Configuration des cookies selon l'environnement
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  path: '/',
});

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives par minute
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto);
    
    // Définir le cookie httpOnly avec le token
    response.cookie('access_token', result.access_token, getCookieOptions());
    
    return result;
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives par minute
  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    
    // Définir le cookie httpOnly avec le token
    response.cookie('access_token', result.access_token, getCookieOptions());
    
    return result;
  }

  @Post('logout')
  @ApiOperation({ summary: "Déconnexion de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  async logout(@Res({ passthrough: true }) response: Response) {
    // Supprimer le cookie
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
    
    return { message: 'Déconnexion réussie' };
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('me')
  @ApiOperation({ summary: "Obtenir le profil de l'utilisateur connecté" })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('verify-email/:token')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 tentatives par minute
  @ApiOperation({ summary: "Vérifier l'email d'un utilisateur" })
  @ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
  @ApiResponse({ status: 404, description: 'Token invalide' })
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 tentatives par minute
  @ApiOperation({ summary: "Renvoyer l'email de vérification" })
  @ApiResponse({ status: 200, description: 'Email envoyé' })
  @ApiResponse({ status: 400, description: 'Email déjà vérifié' })
  async resendVerification(@CurrentUser() user: any) {
    return this.authService.resendVerificationEmail(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-email')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 tentatives par minute
  @ApiOperation({ summary: "Modifier l'email (uniquement si non vérifié)" })
  @ApiResponse({ status: 200, description: 'Email mis à jour' })
  @ApiResponse({ status: 400, description: 'Email déjà vérifié ou invalide' })
  async updateEmail(@CurrentUser() user: any, @Body('email') email: string) {
    return this.authService.updateEmail(user.id, email);
  }
}
