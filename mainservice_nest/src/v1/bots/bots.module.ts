import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { MyBotsController } from './bots.controller';
import { MyBotsService } from './bots.service';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule
  ],
  controllers: [MyBotsController],
  providers: [MyBotsService],
})
export class MyBotsModule {}
