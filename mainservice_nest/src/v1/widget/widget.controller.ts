import { Body, Controller, Get, Post } from '@nestjs/common';
import { WidgetService } from './widget.service';

@Controller('widget')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post('generate-token')
  async generateWidgetToken(@Body() body: any) {
    return this.widgetService.generateWidgetTokenService({
      userId: body.userId,
      botId: body.botId,
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
