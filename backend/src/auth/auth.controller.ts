import { Controller, Post, Body, UseGuards, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: "Obtenir le profil de l'utilisateur connecté" })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: "Vérifier l'email d'un utilisateur" })
  @ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
  @ApiResponse({ status: 404, description: 'Token invalide' })
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-verification')
  @ApiOperation({ summary: "Renvoyer l'email de vérification" })
  @ApiResponse({ status: 200, description: 'Email envoyé' })
  @ApiResponse({ status: 400, description: 'Email déjà vérifié' })
  async resendVerification(@CurrentUser() user: any) {
    return this.authService.resendVerificationEmail(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-email')
  @ApiOperation({ summary: "Modifier l'email (uniquement si non vérifié)" })
  @ApiResponse({ status: 200, description: 'Email mis à jour' })
  @ApiResponse({ status: 400, description: 'Email déjà vérifié ou invalide' })
  async updateEmail(@CurrentUser() user: any, @Body('email') email: string) {
    return this.authService.updateEmail(user.id, email);
  }
}
