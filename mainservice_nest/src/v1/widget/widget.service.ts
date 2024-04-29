import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

interface payloadJWT {
  userId: string;
  botId: string;
  iat: number;
  exp: number;
}
@Injectable()
export class WidgetService {
  constructor(private readonly prismaService: PrismaService) {}
  async _decodeWidgetTokenService(token: string) {
    try {
      const payload = (await jwt.verify(
        token,
        process.env.JWT_SECRET,
      )) as payloadJWT;
      if (!payload) {
        return null;
      }
      // const user = await this.prismaService.users.findUnique({
      //   where: {
      //     user_id: payload.userId,
      //   },
      // });

      // if (!user) return null;

      return payload;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async getCollectionNameService(token: string) {
    const decoded = await this._decodeWidgetTokenService(token);
    return {
      collection: decoded?.botId,
    };
  }
  async generateWidgetTokenService({
    userId,
    botId,
  }: {
    userId: string;
    botId: string;
  }) {
    const payload = { userId, botId };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 81000,
    });

    return token;
  }
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
