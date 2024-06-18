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
  private async _decodeWidgetTokenService(token: string) {
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
  private _toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this._toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, char) =>
          char.toUpperCase(),
        );
        result[camelKey] = this._toCamelCase(obj[key]);
        return result;
      }, {} as any);
    }
    return obj;
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
  async getBotConfigService({ botId }: { botId: string }) {
    const foundBotConfig = await this.prismaService.bots.findFirst({
      where: {
        bot_id: botId,
      },
      select: {
        general_configs: true,
        model_configs: true,
        ui_configs: true,
        security_configs: true,
      },
    });

    return this._toCamelCase(foundBotConfig);
  }
}
