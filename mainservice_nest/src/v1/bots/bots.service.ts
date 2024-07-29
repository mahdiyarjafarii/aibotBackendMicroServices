import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { BotCreate } from './dtos/mybots.dto';

@Injectable()
export class MyBotsService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async cretaeBots(userId: string) {
    const persianBotNames = [
      'هوشمند',
      'یارا',
      'پشتیبان',
      'پردازشگر',
      'نیک‌یار',
      'آوا',
      'ماهور',
      'آریا',
      'راهنما',
      'ساینا',
      'مهسا',
      'نوید',
      'نگهبان',
      'کاوشگر',
      'تیرا',
      'رویا',
      'کیان',
      'شبنم',
      'رایان',
      'پیشرو',
    ];
    const uiConfigs = {
      greet_msgs: ["سلام ! امروز چطور می‌توانم به شما کمک کنم؟"],
      notification_msgs: ["سلام ! امروز چطور می‌توانم به شما کمک کنم؟"],
      action_btns: ["چگونه میتونم بات بسازم؟"],
      placeholder_msg: "پیام شما ...",
      input_types: [],
      ask_credentials: {},
      footer_msg: "hamyar.chat",
      bot_name: "raya chat",
      user_msg_bg_color: "#3b81f6",
      bot_image: "https://test.png",
      bot_widget_border_color: "#6495ed",
      bot_widget_position: "start",
      init_msg_delay: 20,
    };
    const securityConfigs = {
      access_bot: "private",
      status_bot: "enable",
      rate_limit_msg: 20,
      rate_limit_time: "240",
      rate_limit_msg_show: "تعداد درخواست شما زیاد تر از استاندارد بات می باشد.",
    };

    function getRandomPersianBotName(names: string[]): string {
      const randomIndex = Math.floor(Math.random() * names.length);
      return names[randomIndex];
    };

    try {
      const randomBotName = getRandomPersianBotName(persianBotNames);
      const createdBot = await this.prismaService.bots.create({
        data: {
          user_id: userId,
          name: randomBotName,
          ui_configs: uiConfigs,
          security_configs: securityConfigs,
        },
      });
      return createdBot;
    } catch (error) {
      console.log(error);
    }
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

  async updateDataSource(data: any,dataSourceId:string) {
    try {
      const createdDataSource = await this.prismaService.datasources.update({
       where:{
        datasource_id:dataSourceId
       },
       data:data
      });
      return createdDataSource;
    } catch (error) {
      console.log(error);
    }
  };


  async createDataSource(data: any) {
    try {
      const createdDataSource = await this.prismaService.datasources.create({
        data,
      });
      return createdDataSource;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllBots(
    pageNumber: number,
    itemsPerPage: number,
    type: string,
    search: string,
    user_id: string,
  ) {
    const totalCount = await this.prismaService.bots.count({
      where: {
        user_id,
        type,
        name: {
          contains: search || '',  
          mode: 'insensitive', 
        },
      },
    });

    const bots = await this.prismaService.bots.findMany({
      where: {
        user_id,
        type,
        name: {
          contains: search || '',  
          mode: 'insensitive', 
        },
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
        orderBy: {
          created_at: 'desc', // Replace 'createdAt' with the appropriate timestamp field
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

    return this._toCamelCase(conversations);
  }

  async deleteBot(botId: string, userId: string): Promise<boolean> {
    try {
      const bot = await this.prismaService.bots.findFirst({
        where: { bot_id: botId, user_id: userId },
      });
      if (!bot) {
        return false;
      }

      await this.prismaService.bots.delete({
        where: { bot_id: botId },
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async findeBot(botId: string, userId: string): Promise<any> {
    try {
      const bot = await this.prismaService.bots.findFirst({
        where: { bot_id: botId, user_id: userId },
      });
      if (!bot) {
        throw new HttpException('Bot not found', 404);
      }
      return bot;
    } catch (error) {
      console.error('Error finding bot:', error);
      throw new HttpException('Internal Server Error', 500);
    }
  }

  async findeDataSource(botId: string,userId: string): Promise<any> {
    try {
      const dataSource = await this.prismaService.datasources.findFirst({
        where: { bot_id: botId },
        include: {
          bot: {
            select: {
              user_id: true,
            },
          },
        },
      });
      if (!dataSource) {
        throw new HttpException('datasource not found', 404);
      };
      if (dataSource.bot.user_id !== userId) {
        throw new HttpException('Unauthorized', 403);
      }
      return dataSource;
    } catch (error) {
      console.error('Error finding datasource:', error);
      throw new HttpException('Internal Server Error', 500);
    }
  };

  async findeConfigs(botId: string,userId: string): Promise<any> {
    try {
      const configs = await this.prismaService.bots.findFirst({
        where: { bot_id: botId },
        select: {
          bot_id: true,
          name: true,
          created_at: true,
          updated_at: true,
          type: true,
          general_configs: true,
          model_configs: true,
          ui_configs: true,
          security_configs: true,
          evals: true,
          status: true,
      },
      });
      if (!configs) {
        throw new HttpException('datasource not found', 404);
      };
  
      return configs;
    } catch (error) {
      console.error('Error finding Configs:', error);
      throw new HttpException('Internal Server Error', 500);
    }
  };

  async updateGeneralConfig(botId: string, userId: string, updateData: { name: string }): Promise<any> {
    try {
      const updatedConfig = await this.prismaService.bots.update({
        where: { bot_id: botId, user_id: userId },
        data: {
          name: updateData.name,
        },
      });
      if (!updatedConfig) {
        throw new HttpException('Update failed', 404);
      }
      return updatedConfig;
    } catch (error) {
      console.error('Error updating Configs:', error);
      throw new HttpException('Internal Server Error', 500);
    }
  };

  async updateModelConfig(botId: string, userId: string, updateData:{ model_name: string,Temperature:number } ): Promise<any> {
    try {
      const updatedConfig = await this.prismaService.bots.update({
        where: { bot_id: botId, user_id: userId },
        data: {
          model_configs:updateData
        },
      });
      if (!updatedConfig) {
        throw new HttpException('Update failed', 404);
      }
      return updatedConfig;
    } catch (error) {
      console.error('Error updating Configs:', error);
      throw new HttpException('Internal Server Error', 500);
    }
  };

  async updateUiConfig(botId: string, userId: string, updateData:any ): Promise<any> {
    try {
      const updatedConfig = await this.prismaService.bots.update({
        where: { bot_id: botId, user_id: userId },
        data: {
         ui_configs:updateData
        },
      });
      if (!updatedConfig) {
        throw new HttpException('Update failed', 404);
      }
      return updatedConfig;
    } catch (error) {
      console.error('Error updating Configs:', error);
      throw new HttpException('Internal Server Error', 500);
    }
  };
  async updateSecurityConfig(botId: string, userId: string, updateData:any ): Promise<any> {
    try {
      const updatedConfig = await this.prismaService.bots.update({
        where: { bot_id: botId, user_id: userId },
        data: {
         security_configs:updateData
        },
      });
      if (!updatedConfig) {
        throw new HttpException('Update failed', 404);
      }
      return updatedConfig;
    } catch (error) {
      console.error('Error updating Configs:', error);
      throw new HttpException('Internal Server Error', 500);
    }
  };
  async countBots(userId: string): Promise<number> {
    try {
      return await this.prismaService.bots.count({
        where: {
          user_id: userId,
        },
      });
    } catch (error) {
      throw new HttpException('Failed to count bots', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  
}

