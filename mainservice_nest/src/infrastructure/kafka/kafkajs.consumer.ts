import { Logger } from '@nestjs/common';
import {
  Consumer,
  ConsumerConfig,
  //ConsumerSubscribeTopic,
  ConsumerSubscribeTopics,
  Kafka,
  KafkaMessage,
} from 'kafkajs';
import * as retry from 'async-retry';
import { sleep } from '../utils/sleep';
import { IConsumer } from './consumer.interface';
//import { DatabaseService } from '../database/database.service';

export class KafkajsConsumer implements IConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger: Logger;

  constructor(
    private readonly topics: ConsumerSubscribeTopics,
    //private readonly databaseService: DatabaseService,
    config: ConsumerConfig,
    broker: string,
  ) {
    this.kafka = new Kafka({
      brokers: [broker],
      ssl: true,
      sasl: {
        mechanism: 'scram-sha-256', // scram-sha-256 or scram-sha-512
        username: 'aqkjtrhb',
        password: 'JSY-cpUfbH6qH5pt2DxbFriMo-tTgygV',
      },
    });
    this.consumer = this.kafka.consumer(config);
    this.logger = new Logger(`${topics.topics}-${config.groupId}`);
  }

  async consume(onMessage: (message: KafkaMessage) => Promise<void>) {
    await this.consumer.subscribe(this.topics);
    await this.consumer.run({
      eachMessage: async ({ message, partition }) => {
        this.logger.debug(`Processing message partition: ${partition}`);
        try {
          await retry(async () => onMessage(message), {
            retries: 3,
            onRetry: (error, attempt) =>
              this.logger.error(
                `Error consuming message, executing retry ${attempt}/3...`,
                error,
              ),
          });
        } catch (err) {
          this.logger.error(
            'Error consuming message. Adding to dead letter queue...',
            err,
          );
          //await this.addMessageToDlq(message);
        }
      },
    });
  }

  // private async addMessageToDlq(message: KafkaMessage) {
  //   await this.databaseService
  //     .getDbHandle()
  //     .collection('dlq')
  //     .insertOne({ value: message.value, topic: this.topic.topic });
  // }

  async connect() {
    try {
      await this.consumer.connect();
    } catch (err) {
      this.logger.error('Failed to connect to Kafka.', err);
      await sleep(5000);
      await this.connect();
    }
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}
