import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Matches,
} from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsString()
  @IsOptional()
  salonName?: string;

  @IsString()
  @IsOptional()
  salonDescription?: string;

  @IsString()
  @IsOptional()
  salonAddress?: string;

  @IsString()
  @IsOptional()
  salonPhone?: string;

  @IsString()
  @IsOptional()
  salonEmail?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  heroImageUrl?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'defaultOpenTime must be in HH:mm format',
  })
  defaultOpenTime?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'defaultCloseTime must be in HH:mm format',
  })
  defaultCloseTime?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  bookingAdvanceMinDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  bookingAdvanceMaxDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cancellationDeadlineHours?: number;

  @IsBoolean()
  @IsOptional()
  emailNotificationsEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reminderDaysBefore?: number;

  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @IsString()
  @IsOptional()
  instagramUrl?: string;
}
