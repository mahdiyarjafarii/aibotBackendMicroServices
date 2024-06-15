import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import { BotCreate } from './dtos/mybots.dto';

@Injectable()
export class MyBotsService {
    constructor(
        private readonly prismaService: PrismaService,
    ){}


  async cretaeBots(
  userId:string
  ){
    const persianBotNames = [
      "هوشمند", "یارا", "پشتیبان", "پردازشگر", "نیک‌یار", "آوا", "ماهور", "آریا", "راهنما", "ساینا",
      "مهسا", "نوید", "نگهبان", "کاوشگر", "تیرا", "رویا", "کیان", "شبنم", "رایان", "پیشرو"
    ];

    function getRandomPersianBotName(names: string[]): string {
      const randomIndex = Math.floor(Math.random() * names.length);
      return names[randomIndex];
    }

    try{
      const randomBotName = getRandomPersianBotName(persianBotNames);
      const createdBot=await this.prismaService.bots.create({
        data:{
          user_id:userId,
          name: randomBotName
        }
      })
      return createdBot;
    }catch(error){
      console.log(error)
    }
  };

  async createDataSource(
    data:any
  ){
    try{
      const createdDataSource=await this.prismaService.datasources.create({
        data
      });
      return createdDataSource;

    }catch(error){
      console.log(error)
    }
  };


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
