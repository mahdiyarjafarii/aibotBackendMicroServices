import { Module } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { WidgetController } from './widget.controller';

@Module({
  providers: [WidgetService],
  controllers: [WidgetController]
})
export class WidgetModule {}
