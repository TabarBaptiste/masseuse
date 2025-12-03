import { IsString, IsNumber, IsOptional, IsBoolean, Min, MinLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
