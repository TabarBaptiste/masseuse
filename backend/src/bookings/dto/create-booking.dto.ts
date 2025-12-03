import { IsString, IsDateString, IsOptional, Matches } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  serviceId: string;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
