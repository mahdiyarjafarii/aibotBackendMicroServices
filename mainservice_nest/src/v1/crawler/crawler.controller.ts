import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { Query} from '@nestjs/common/decorators';

@Controller({
    path: 'crawlerlink',
    version: '1',
  })
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get()
  async getListLink(
    @Query('url') url?: string,
  ) {
    return await this.crawlerService.getavailableLink(url);
  }
}
