import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { CoffeeResponseDto } from './dto/coffee-response.dto';
import { FilterCoffeeDto } from './dto/filter-coffee.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CoffeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CoffeeResponseDto[]> {
    const coffees = await this.prisma.coffee.findMany({
      include: { tags: { include: { tag: true } } },
    });

    return coffees.map(c => ({
      ...c,
      price: c.price.toNumber(),
      tags: c.tags.map(t => t.tag.name),
    }));
  }

  async findOne(id: string): Promise<CoffeeResponseDto> {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });

    if (!coffee) {
      throw new NotFoundException(`Café com id ${id} não encontrado.`);
    }

    return {
      ...coffee,
      price: coffee.price.toNumber(),
      tags: coffee.tags.map(t => t.tag.name),
    };
  }

  async create(dto: CreateCoffeeDto): Promise<CoffeeResponseDto> {
    try {
      const coffee = await this.prisma.coffee.create({
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          imageUrl: dto.imageUrl,
          tags: {
            create: dto.tags.map(tag => ({
              tag: { connect: { name: tag } },
            })),
          },
        },
        include: { tags: { include: { tag: true } } },
      });

      return {
        ...coffee,
        price: coffee.price.toNumber(),
        tags: coffee.tags.map(t => t.tag.name),
      };
    } catch (error) {
      throw new BadRequestException('Erro ao criar café. Verifique os dados.');
    }
  }

  async update(id: string, dto: Partial<CreateCoffeeDto>): Promise<CoffeeResponseDto> {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });
    if (!coffee) {
      throw new NotFoundException('Café não encontrado');
    }

    const updated = await this.prisma.coffee.update({
      where: { id },
      data: {
        ...dto,
        tags: dto.tags
          ? {
              deleteMany: {},
              create: dto.tags.map(tag => ({
                tag: { connect: { name: tag } },
              })),
            }
          : undefined,
      },
      include: { tags: { include: { tag: true } } },
    });

    return {
      ...updated,
      price: updated.price.toNumber(),
      tags: updated.tags.map(t => t.tag.name),
    };
  }

  async remove(id: string) {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });
    if (!coffee) {
      throw new NotFoundException('Café não encontrado');
    }

    await this.prisma.coffee.delete({ where: { id } });
    return { message: 'Café removido com sucesso' };
  }

  async search(query: FilterCoffeeDto): Promise<CoffeeResponseDto[]> {
    const {
      name,
      minPrice,
      maxPrice,
      tags,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (tags) {
      where.tags = {
        some: {
          tag: {
            name: { in: tags.split(',') },
          },
        },
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [coffees, total] = await Promise.all([
      this.prisma.coffee.findMany({
        where,
        include: { tags: { include: { tag: true } } },
        skip,
        take,
      }),
      this.prisma.coffee.count({ where }),
    ]);

    return coffees.map(c => ({
      ...c,
      price: c.price.toNumber(),
      tags: c.tags.map(t => t.tag.name),
      total,
      page: Number(page),
      limit: Number(limit),
    }));
  }
}
