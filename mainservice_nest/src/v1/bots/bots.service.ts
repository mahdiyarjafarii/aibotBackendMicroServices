import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { BotCreate } from './dtos/mybots.dto';

@Injectable()
export class MyBotsService {
  constructor(private readonly prismaService: PrismaService) {}
  async cretaeBots({ name, type }: BotCreate, user_id: string) {
    const createdBot = await this.prismaService.bots.create({
      data: {
        name,
        type,
        user: { connect: { user_id } },
      },
    });

    return createdBot;
  }

  async getAllBots(
    pageNumber: number,
    itemsPerPage: number,
    type: string,
    user_id: string,
  ) {
    const totalCount = await this.prismaService.bots.count({
      where: {
        user_id,
        type,
      },
    });

    const bots = await this.prismaService.bots.findMany({
      where: {
        user_id,
        type,
      },
      take: +itemsPerPage,
      skip: (pageNumber - 1) * itemsPerPage,
    });

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return {
      bots,
      totalPages,
      itemsPerPage,
      totalItems: totalCount,
    };
  }
  async getConversations(botId: string, conversationId?: string) {
    let conversations;

    if (conversationId) {
      // Fetch a specific conversation by ID
      conversations = await this.prismaService.conversation.findFirst({
        where: { id: conversationId, botId },
      });
    } else {
      // Fetch all conversations for a bot
      conversations = await this.prismaService.conversation.findMany({
        where: { botId },
      });
    }

    if (
      !conversations ||
      (Array.isArray(conversations) && conversations.length === 0)
    ) {
      if (conversationId) {
        throw new NotFoundException(
          `Conversation with ID ${conversationId} not found`,
        );
      } else {
        throw new NotFoundException(
          `No conversations found for bot with ID ${botId}`,
        );
      }
    }

    return conversations;
  }
}
