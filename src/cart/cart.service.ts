import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId?: string) {
    if (userId) {
      const existingCart = await this.prisma.cart.findFirst({
        where: {
          userId,
          status: 'AGUARDANDO_PAGAMENTO',
        },
        include: { items: true },
      });

      if (existingCart) return existingCart;
    }

    return this.prisma.cart.create({
      data: {
        userId: userId || null,
        status: 'AGUARDANDO_PAGAMENTO',
        statusPayment: 'PENDENTE',
      },
    });
  }

  async getCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            coffee: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Carrinho ${cartId} não encontrado`);
    }

    return cart;
  }

  async addItem(cartId: string, addItemDto: AddItemDto) {
    const { coffeeId, quantity } = addItemDto;

    const coffee = await this.prisma.coffee.findUnique({
      where: { id: coffeeId },
    });

    if (!coffee) {
      throw new NotFoundException(`Café com ID ${coffeeId} não encontrado`);
    }

    if (quantity < 1 || quantity > 5) {
      throw new BadRequestException(`A quantidade deve ser entre 1 e 5`);
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId,
        coffeeId,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > 5) {
        throw new BadRequestException(`Limite de 5 unidades por item excedido`);
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId,
        coffeeId,
        quantity,
        unitPrice: coffee.price,
      },
    });
  }

  async updateItem(cartId: string, itemId: string, updateItemDto: UpdateItemDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);
    }

    if (updateItemDto.quantity < 1 || updateItemDto.quantity > 5) {
      throw new BadRequestException(`A quantidade deve ser entre 1 e 5`);
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: updateItemDto.quantity,
      },
    });
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  }
}
