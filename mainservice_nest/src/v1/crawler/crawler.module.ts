import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';


@Module({
  imports: [],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule {}
