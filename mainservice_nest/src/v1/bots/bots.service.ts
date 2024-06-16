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

  async createConversation({
    botId,
    widgetVersion,
    sessionId,
    userIP,
    userLocation,
  }: {
    botId: string;
    widgetVersion: string;
    sessionId: string;
    userIP: string;
    userLocation?: string;
  }): Promise<{ sessionId: string; conversationId: string }> {

    let conversation;
    try {
      conversation = await this.prismaService.conversations.create({
        data: {
          bot_id: botId,
          widget_version: widgetVersion,
          session_id: sessionId,
          user_ip: userIP,
          user_location: userLocation,
          metadata: {}, // Empty object for now
        },
      });
    } catch (error) {
      console.log('Error creating conversation row:', error);
    }

    return {
      sessionId: conversation.session_id,
      conversationId: conversation.conversation_id,
    };
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
      // Fetch a specific conversation by conversation_id and bot_id
      conversations = await this.prismaService.conversations.findFirst({
        where: {
          conversation_id: conversationId,
          bot_id: botId,
        },
        include: {
          records: true, // Optionally include records if you want to fetch messages as well
        },
      });
    } else {
      // Fetch all conversations for a bot
      conversations = await this.prismaService.conversations.findMany({
        where: {
          bot_id: botId,
        },
        include: {
          records: true, // Optionally include records if you want to fetch messages as well
        },
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
