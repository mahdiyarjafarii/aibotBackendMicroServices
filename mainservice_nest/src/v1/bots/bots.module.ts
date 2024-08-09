import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { MyBotsController } from './bots.controller';
import { MyBotsService } from './bots.service';
import { AuthModule } from '../auth/auth.module';
import { S3Service } from 'src/infrastructure/s3/s3.service';


@Module({
  imports: [
    PrismaModule,
    AuthModule
  ],
  controllers: [MyBotsController],
  providers: [MyBotsService,S3Service],
})
export class MyBotsModule {}
