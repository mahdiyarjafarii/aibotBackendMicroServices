import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';


@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CRAWLER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'py-service-client',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'crawler-servicePy-group'
          }
        },
      },
    ]),
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule {}
