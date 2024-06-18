import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WidgetService } from './widget.service';
import {
  GenerateWidgetTokenDto,
  GetBotConfigDto,
  GetCollectionNameDto,
} from './dtos/widget.dto';

@Controller({
  path: 'widget',
  version: '1',
})
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post('generate-token')
  async generateWidgetToken(@Body() body: GenerateWidgetTokenDto) {
    return this.widgetService.generateWidgetTokenService({
      userId: body.userId,
      botId: body.botId,
    });
  }
  @Post('get-collection')
  async getCollectionName(@Body() body: GetCollectionNameDto) {
    return this.widgetService.getCollectionNameService(body.token);
  }

  @Get('config/:botId')
  async getBotConfig(@Param('botId') botId: string) {
    return this.widgetService.getBotConfigService({
      botId: botId,
    });
  }
}
