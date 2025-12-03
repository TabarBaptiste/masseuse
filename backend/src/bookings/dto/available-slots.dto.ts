import { IsString, IsDateString } from 'class-validator';

export class GetAvailableSlotsDto {
  @IsString()
  serviceId: string;

  @IsDateString()
  date: string;
}
