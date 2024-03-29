import { Controller, Get, HttpException, Post,Headers } from '@nestjs/common';
import { Body, Query, Req, UseGuards } from '@nestjs/common/decorators';

import { MyBotsService } from './bots.service';
import { BotCreate } from './dtos/mybots.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { User } from '../decorators/user.decorator';

@Controller({
  path: 'mybots',
  version: '1',
})
export class MyBotsController {
  constructor(private readonly mybotsServices:MyBotsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
    async createBots(
        @Body() botDTO:BotCreate,
        @User() user:any
    ){
      return await this.mybotsServices.cretaeBots(botDTO,user.user_id)
    }

  @UseGuards(JwtAuthGuard)
  @Get('/list')
  async getAllBots(
    @Query('page') pageNumber?: number,
    @Query('itemsPerPage') itemsPerPage?: number,
    @Query('type') type?: string,
    @User() user?:any
  ){
    return await this.mybotsServices.getAllBots(pageNumber,itemsPerPage,type,user.user_id)

  }


    
}
