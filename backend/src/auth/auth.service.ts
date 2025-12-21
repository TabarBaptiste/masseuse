import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Generate email verification token
    const emailVerificationToken = randomBytes(32).toString('hex');

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        emailVerificationToken,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerification(user.email, {
      firstName: user.firstName,
      verificationToken: emailVerificationToken,
    });

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Token de vérification invalide ou expiré');
    }

    if (user.emailVerified) {
      return { message: 'Email déjà vérifié', alreadyVerified: true };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { message: 'Email vérifié avec succès', alreadyVerified: false };
  }

  async resendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email déjà vérifié');
    }

    // Generate new verification token
    const emailVerificationToken = randomBytes(32).toString('hex');

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken },
    });

    // Send verification email
    await this.emailService.sendEmailVerification(user.email, {
      firstName: user.firstName,
      verificationToken: emailVerificationToken,
    });

    return { message: 'Email de vérification envoyé' };
  }

  async updateEmail(userId: string, newEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.emailVerified) {
      throw new BadRequestException(
        'Vous ne pouvez pas modifier votre email une fois vérifié',
      );
    }

    // Check if new email is already taken
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: newEmail,
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    // Generate new verification token
    const emailVerificationToken = randomBytes(32).toString('hex');

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerificationToken,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });

    // Send verification email to new address
    await this.emailService.sendEmailVerification(newEmail, {
      firstName: user.firstName,
      verificationToken: emailVerificationToken,
    });

    return updatedUser;
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException(
        "Aucun compte n'est associé à cette adresse e-mail.",
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect.');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // try {
    const token = this.jwtService.sign(payload);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
      access_token: token,
    };
    // } catch (error) {
    //   console.error('💥 JWT generation failed:', error.message);
    //   throw error;
    // }
  }

  // ========================================
  // RÉINITIALISATION DU MOT DE PASSE
  // ========================================

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user) {
      return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' };
    }

    // Générer un token sécurisé
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Sauvegarder le token dans la base
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Envoyer l'email
    await this.emailService.sendPasswordResetEmail(user.email, {
      firstName: user.firstName,
      resetToken,
    });

    return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Trouver l'utilisateur avec ce token
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: resetPasswordDto.token },
    });

    if (!user) {
      throw new BadRequestException('Token de réinitialisation invalide ou expiré');
    }

    // Vérifier que le token n'a pas expiré
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Token de réinitialisation expiré');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 12);

    // Mettre à jour le mot de passe et supprimer le token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
