import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { hostname } from 'os';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            ssl: true,
            sasl: {
              mechanism: 'scram-sha-512',
              username: 'aqkjtrhb',
              password: 'JSY-cpUfbH6qH5pt2DxbFriMo-tTgygV',
            },
            clientId: hostname(),
            brokers: ['dory.srvs.cloudkafka.com:9094'],
          },
          producerOnlyMode: true,
          // consumer: {
          //   groupId: 'aqkjtrhb-foo',
          // },
        },
      },
    ]),
  ],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule {}
