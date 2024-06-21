import { Controller, Get, HttpException, Post,Headers } from '@nestjs/common';
import { Body, Delete, Param, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common/decorators';

import { MyBotsService } from './bots.service';


import { User } from '../decorators/user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { cwd } from 'process';
import { existsSync, mkdirSync, renameSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { BotCreate } from './dtos/mybots.dto';

@Controller({
  path: 'mybots',
  version: '1',
})
export class MyBotsController {
  constructor(private readonly mybotsServices:MyBotsService) {}
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
        @User() user?:any
    ){
      console.log(user)
    
      const createdBot= await this.mybotsServices.cretaeBots(user?.user_id);
      const data={
       ...botsDTO,
       bot_id:createdBot.bot_id
      }

      if(files?.length){
        renameSync(`${cwd()}/uploads/tmp`, `${cwd()}/uploads/${createdBot.bot_id}`);
        const fileUrlPrefix = process.env.IMAGE_URL_PREFIX || 'http://localhost:12000';
        const fileLink=`${fileUrlPrefix}/uploads/${createdBot.bot_id}/${files[0].originalname}`
        data["static_files"]=`[${fileLink}]`

      };
        

      const createdDataSource=await this.mybotsServices.createDataSource(data);

      return createdDataSource


  
    }






  @UseGuards(JwtAuthGuard)
  @Get('/list')
  async getAllBots(
    @Query('page') pageNumber?: number,
    @Query('itemsPerPage') itemsPerPage?: number,
    @Query('type') type?: string,
    @User() user?:any
  ){
    console.log(user,"test")
    return await this.mybotsServices.getAllBots(pageNumber,itemsPerPage,type,user.user_id)

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
