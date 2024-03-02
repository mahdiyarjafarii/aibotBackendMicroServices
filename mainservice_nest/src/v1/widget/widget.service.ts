import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class WidgetService {
  constructor(private readonly prismaService: PrismaService) {}
  async getBotConfigService({
    userId,
    botId,
  }: {
    userId: string;
    botId: string;
  }) {
    const foundBotConfig = this.prismaService.bots.findFirst({
      where: {
        bot_id: botId,
        user_id: userId,
      },
    });

    return foundBotConfig;
  }
}
