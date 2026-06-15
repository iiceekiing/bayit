import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { PropertyType, PropertyStatus, Amenity } from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  toilets?: number;

  @IsOptional()
  @IsNumber()
  parkingSpaces?: number;

  @IsOptional()
  @IsNumber()
  landSize?: number;

  @IsOptional()
  @IsNumber()
  floorArea?: number;

  @IsOptional()
  @IsNumber()
  yearBuilt?: number;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Amenity, { each: true })
  amenities?: Amenity[];

  @IsOptional()
  @IsArray()
  inspectionSlots?: CreateInspectionSlotDto[];
}

export class CreateInspectionSlotDto {
  @IsString()
  date: string;

  @IsString()
  time: string;

  @IsOptional()
  @IsNumber()
  maxVisitors?: number;

  @IsOptional()
  @IsNumber()
  fee?: number;
}
