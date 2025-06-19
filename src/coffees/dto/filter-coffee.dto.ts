import {
    IsOptional,
    IsString,
    IsNumberString,
    IsDateString,
  } from 'class-validator';
  
  export class FilterCoffeeDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsNumberString()
    minPrice?: string;
  
    @IsOptional()
    @IsNumberString()
    maxPrice?: string;
  
    @IsOptional()
    @IsString()
    tags?: string;
  
    @IsOptional()
    @IsDateString()
    startDate?: string;
  
    @IsOptional()
    @IsDateString()
    endDate?: string;
  
    @IsOptional()
    @IsNumberString()
    page?: string;
  
    @IsOptional()
    @IsNumberString()
    limit?: string;
  }
  