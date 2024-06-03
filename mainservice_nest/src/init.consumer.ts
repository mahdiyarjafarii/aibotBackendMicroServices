import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from './infrastructure/kafka/consumer.service';

@Injectable()
export class InitConsumer implements OnModuleInit {
  constructor(private readonly consumerService: ConsumerService) {}

  async onModuleInit() {
    const topic = 'aqkjtrhb-default';

    await this.consumerService.consume({
      topics: { topics: [topic] },
      config: {
        groupId: 'aqkjtrhb-default',
      },
      onMessage: async (message) => {
        console.log({
          value: message.value.toString(),
        });
        //throw new Error('Test error!');
      },
    });
  }
}
