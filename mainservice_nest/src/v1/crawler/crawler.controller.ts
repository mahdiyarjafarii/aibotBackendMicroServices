import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { Body, Post, Query } from '@nestjs/common/decorators';
import { UserUrlsReqDTO } from './dtos/crawler.dto';

@Controller({
  path: 'crawler',
  version: '1',
})
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('links')
  async getListLink(@Query('url') url?: string) {
    return await this.crawlerService.getavailableLink(url);
  }

  @Post()
  async sendArrayLinkForCrawler(@Body() UserUrlsReq: UserUrlsReqDTO) {
    return await this.crawlerService.sendUrlToCrawler(
      UserUrlsReq.botId,
      UserUrlsReq.urls,
    );
  }
}
