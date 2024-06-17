import { Body, Controller, Get, Post } from '@nestjs/common';
import { WidgetService } from './widget.service';
import {
  GenerateWidgetTokenDto,
  GetBotConfigDto,
  GetCollectionNameDto,
} from './dtos/widget.dto';

@Controller('widget')
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

  @Get('config')
  async getBotConfig(@Body() body: GetBotConfigDto) {
    return this.widgetService.getBotConfigService({
      botId: body.botId,
    });
  }
}
