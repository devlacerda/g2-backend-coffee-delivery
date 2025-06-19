import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateCoffeeDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(10, 200)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'preço deve ser positivo e tenha no máximo 2 casas decimais' })
  @IsPositive()
  price: number;

  @IsUrl()
  imageUrl: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags: string[];
}
