import { IsEnum, IsString, IsOptional } from 'class-validator';
import { BookingStatus } from '../../../generated/prisma';

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  proNotes?: string;
}
