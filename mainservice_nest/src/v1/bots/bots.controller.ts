import { Controller, Get, HttpException, Post, Headers } from '@nestjs/common';
import {
  Body,
  Ip,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common/decorators';
import { v4 as uuidv4 } from 'uuid';

import { MyBotsService } from './bots.service';
import { BotCreate, CreateConversationDto } from './dtos/mybots.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { ChatSessionId } from '../decorators/chatSession.decorator';
import { Request, Response } from 'express';

@Controller({
  path: 'mybots',
  version: '1',
})
export class MyBotsController {
  constructor(private readonly mybotsServices: MyBotsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async createBots(@Body() botDTO: BotCreate, @User() user: any) {
    return await this.mybotsServices.cretaeBots(botDTO, user.user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/list')
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

  @UseGuards(JwtAuthGuard)
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
}
