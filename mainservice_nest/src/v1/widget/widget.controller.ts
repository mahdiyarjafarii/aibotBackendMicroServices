import { Controller, Get } from '@nestjs/common';
import { WidgetService } from './widget.service';

@Controller('widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get('generate-token')
  async generateWidgetToken({
    userId,
    botId,
  }: {
    userId: string;
    botId: string;
  }) {
    return this.widgetService.generateWidgetTokenService({
      userId,
      botId,
    });
  }

  @Get('config')
  async getBotConfig({ userId, botId }: { userId: string; botId: string }) {
    return this.widgetService.getBotConfigService({
      userId,
      botId,
    });
  }
}
