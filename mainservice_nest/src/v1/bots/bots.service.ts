import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { BotCreate } from './dtos/mybots.dto';

@Injectable()
export class MyBotsService {
    constructor(
        private readonly prismaService: PrismaService,
    ){}
  async cretaeBots(
    {
        name,
        type
    }:BotCreate,
    user_id:string
  ){
    const createdBot= await this.prismaService.bots.create({
        data:{
            name,
            type,
            user: { connect: { user_id } }
        }
    })

    return createdBot
  }

  async getAllBots(
    pageNumber:number
    ,itemsPerPage:number,
    type:string,
    user_id:string
  ){

    const totalCount= await this.prismaService.bots.count({
        where:{
            user_id,
            type
        }
    })

    const bots = await this.prismaService.bots.findMany({
        where:{
            user_id,
            type
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
}
