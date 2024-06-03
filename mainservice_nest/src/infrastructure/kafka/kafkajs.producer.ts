import { Logger } from '@nestjs/common';
import { Kafka, Message, Producer } from 'kafkajs';
import { sleep } from '../utils/sleep';
import { IProducer } from './producer.interface';

export class KafkajsProducer implements IProducer {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly logger: Logger;

  constructor(
    private readonly topic: string,
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
    this.producer = this.kafka.producer();
    this.logger = new Logger(topic);
  }

  async produce(message: Message) {
    await this.producer.send({ topic: this.topic, messages: [message] });
  }

  async connect() {
    try {
      await this.producer.connect();
    } catch (err) {
      this.logger.error('Failed to connect to Kafka.', err);
      await sleep(5000);
      await this.connect();
    }
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}
