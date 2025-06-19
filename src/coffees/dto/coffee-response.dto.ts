export class CoffeeResponseDto {
  id: string; 
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  tags: string[];

  createdAt?: Date;
  updatedAt?: Date;

  total?: number;
  page?: number;
  limit?: number;
}
