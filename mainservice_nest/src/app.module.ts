import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './v1/crawler/crawler.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './v1/auth/auth.module';
import { MyBotsModule } from './v1/bots/bots.module';
import { ConfigModule } from '@nestjs/config';
import { InitConsumer } from './init.consumer';
import { ConsumerService } from './infrastructure/kafka/consumer.service';
@Module({
  imports: [
    CrawlerModule,
    PrismaModule,
    AuthModule,
    MyBotsModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService, ConsumerService, InitConsumer],
})
export class AppModule {}
