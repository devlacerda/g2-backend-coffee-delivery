import { PartialType } from '@nestjs/mapped-types';
import { CreateCoffeeDto } from './create-coffee.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
