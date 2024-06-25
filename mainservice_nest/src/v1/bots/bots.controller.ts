import { Controller, Get, HttpException, Post, Headers } from '@nestjs/common';
import {
  Body,
  Delete,
  Ip,
  Param,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common/decorators';

import { MyBotsService } from './bots.service';
import { BotCreate, CreateConversationDto } from './dtos/mybots.dto';

import { User } from '../decorators/user.decorator';
import { ChatSessionId } from '../decorators/chatSession.decorator';
import { Request, Response } from 'express';

import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { cwd } from 'process';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller({
  path: 'mybots',
  version: '1',
})
export class MyBotsController {
  constructor(private readonly mybotsServices: MyBotsService) {}
  @Post('/create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 7, {
      storage: multer.diskStorage({
        destination: function (req, file, cb) {
          const destinationPath = `${cwd()}/uploads/tmp`;

          if (!existsSync(destinationPath)) {
            try {
              mkdirSync(destinationPath, { recursive: true }); // Ensure parent directories are created
            } catch (err) {
              return cb(err);
            }
          }

          cb(null, destinationPath);
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async createBots(
    @UploadedFiles() files: any,
    @Body() botsDTO: BotCreate,
    @User() user?: any,
  ) {
    ;

    const createdBot = await this.mybotsServices.cretaeBots(user?.user_id);
    const data = {
      ...botsDTO,
      bot_id: createdBot.bot_id,
    };

    if (files?.length) {
      renameSync(
        `${cwd()}/uploads/tmp`,
        `${cwd()}/uploads/${createdBot.bot_id}`,
      );
      const fileUrlPrefix =
        process.env.IMAGE_URL_PREFIX || 'http://localhost:12000';
      const fileLink = `${fileUrlPrefix}/uploads/${createdBot.bot_id}/${files[0].originalname}`;
      data['static_files'] = `[${fileLink}]`;
    }

    const createdDataSource = await this.mybotsServices.createDataSource(data);

    return createdDataSource;
  }

  @Get('/list')
  @UseGuards(JwtAuthGuard)
  async getAllBots(
    @Query('page') pageNumber?: number,
    @Query('itemsPerPage') itemsPerPage?: number,
    @Query('type') type?: string,
    @User() user?: any,
  ) {
    return await this.mybotsServices.getAllBots(
      pageNumber,
      itemsPerPage,
      type,
      user.user_id,
    );
  }

  @Post(':botId/conversations')
  async createConversation(
    @Param('botId') botId: string,
    @Body() createConversationDto: CreateConversationDto,
    @ChatSessionId() sessionId: string,
    @Ip() userIP,
    @Res() res: Response,
  ) {
    const widgetVersion = createConversationDto.widgetVersion;
    //const userLocation = await this.getUserLocation(userIP); // Function to fetch user location from IP

    let currentSessionId = sessionId;
    let createConversation: {
      sessionId: string;
      conversationId: string;
    };
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      createConversation = await this.mybotsServices.createConversation({
        botId,
        widgetVersion,
        sessionId: currentSessionId,
        userIP,
      });
      const oneDayMaxAge = 24 * 60 * 60 * 1000;
      res.cookie('session_id', currentSessionId, { maxAge: oneDayMaxAge });
    }

    return res.json({ conversationId: createConversation?.conversationId });
  }

  //@UseGuards(JwtAuthGuard)
  @Get(':botId/conversations')
  async getBotConversations(@Param('botId') botId: string) {
    return this.mybotsServices.getConversations(botId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':botId/conversations/:conversationId')
  async getBotConversationById(
    @Param('botId') botId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.mybotsServices.getConversations(botId, conversationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list/:bot_id')
  async getBot(@Param('bot_id') botId: string, @User() user: any) {
    try {
      const result = await this.mybotsServices.findeBot(botId, user.user_id);
      if (!result) {
        throw new HttpException('Bot not found', 404);
      }
      return result;
    } catch (error) {
      throw new HttpException('Failed to get your bot', 500);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:bot_id')
  async deleteBot(@Param('bot_id') botId: string, @User() user: any) {
    try {
      const result = await this.mybotsServices.deleteBot(botId, user.user_id);
      if (result) {
        return { message: 'Bot deleted successfully' };
      } else {
        throw new HttpException('Bot not found or not authorized', 404);
      }
    } catch (error) {
      throw new HttpException('Failed to delete bot', 500);
    }
  }
}
