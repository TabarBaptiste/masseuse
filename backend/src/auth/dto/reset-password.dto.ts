import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Token de réinitialisation',
    })
    @IsString()
    @IsNotEmpty({ message: 'Token requis' })
    token: string;

    @ApiProperty({
        description: 'Nouveau mot de passe',
        minLength: 8,
    })
    @IsString()
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
        message: 'Le mot de passe doit contenir au moins 1 caractère spécial (!@#$%^&*...)',
    })
    @Matches(/(?=.*\d)/, {
        message: 'Le mot de passe doit contenir au moins 1 chiffre',
    })
    @IsNotEmpty({ message: 'Mot de passe requis' })
    password: string;
}
