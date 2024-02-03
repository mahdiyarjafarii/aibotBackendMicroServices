import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './v1/crawler/crawler.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './v1/auth/auth.module';

@Module({
  imports: [
    CrawlerModule,
    PrismaModule,
    AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
